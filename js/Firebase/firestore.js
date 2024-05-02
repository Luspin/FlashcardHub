import { collection, doc, getDocs, setDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { firebaseApp } from "./firebaseApp.js";
import { DB_NAME, availableStores, activeStore } from "../FlashcardHub/deckManagement.js";

// reference the Firestore Database
const firestoreDatabase = getFirestore(firebaseApp);

export const retrieveUserScores = async (userId) => {

    availableStores.forEach(async (store) => {
        const collectionReference = collection(firestoreDatabase, "users", userId, store.name);

        try {
            const collectionRecords = await getDocs(collectionReference);

            if (!collectionRecords.empty) {
                console.log(`Retrieved ${collectionRecords.docs.length} records from '${userId}' > '${store.name}'`);

                collectionRecords.forEach(async (record) => {
                    await synchronizeUserScores(
                        store.name,
                        record.id,
                        record.data()
                    );
                });
            } else {
                console.log(`No records found for '${userId}' > '${store.name}'`);
            }
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    });

};

const synchronizeUserScores = async (storeName, recordIdentifier, recordData) => {

    const connectionRequest = indexedDB.open(DB_NAME);

    connectionRequest.onsuccess = (event) => {
        const databaseConnection = event.target.result;
        const transaction = databaseConnection.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const questionIndex = objectStore.index("questionIndex");
        const indexRetrieval = questionIndex.get(recordIdentifier);

        (async () => {
            for (const property in recordData) {
                try {
                    indexRetrieval.onsuccess = (event) => {
                        const localEntry = event.target.result;
                        localEntry[property] = recordData[property];
                        const updateRequest = objectStore.put(localEntry);
                    };
                } catch (error) {
                    console.error(`Failed to synchronize local records for '${recordIdentifier}': ${error}`);
                }
            }
        })().then(() => {
            transaction.oncomplete = () => {
                console.log(`'${storeName}' > '${recordIdentifier}' record successfully synchronized from Firestore.`);
            };
            transaction.onerror = (event) => {
                console.error(`Transaction Error: ${event.target.error}`);
            };
        });
    };

    connectionRequest.onerror = (event) => {
        console.error(`Couldn't connect to '${DB_NAME}': ${event.target.error}`);
    };

};

export const uploadUserScores = async (firebaseUser, userResponse) => {
    const userReference = doc(firestoreDatabase, "users", firebaseUser.uID);
    const collectionReference = collection(userReference, activeStore);
    const recordReference = doc(collectionReference, userResponse.question);

    try {
        await setDoc(recordReference, {
            correctGuesses   : userResponse.correctGuesses,
            incorrectGuesses : userResponse.incorrectGuesses
        }, { merge: true }); // update fields without overwriting the entire document

        console.log(`Updated remote record for '${firebaseUser.uID}' > '${activeStore}' > '${userResponse.question}'`);
    } catch (error) {
        console.error(`Couldn't update remote record for '${firebaseUser.uID}' > '${activeStore}' > '${userResponse.question}'`);
    }
};
