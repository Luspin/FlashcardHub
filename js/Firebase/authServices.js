import { firebaseApp } from "./firebaseApp.js";
import { getAuth, onAuthStateChanged , OAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getActiveStore } from "../userPreferences.js";

import { firestoreDatabase } from "./firebaseApp.js";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { DB_NAME } from '../indexedDbOperations.js';


const authProviders = {
    microsoft: new OAuthProvider('microsoft.com')
};

onAuthStateChanged(getAuth(), async (user) => {
    if (user) {
        // User is signed in
        console.log("authServices: User is signed in:", user);
        await loadScores();
    } else {
        // User is signed out
        console.log("No user is signed in.");
    }
});

// Microsoft Sign-In
export function signInWithMicrosoft() {
    signInWithPopup((getAuth(firebaseApp)), authProviders['microsoft'])
    .then((result) => {
        // console.log(`User signed in with Microsoft: ${result.user.displayName}`);
        const userInfo = {
            displayName : result.user.displayName,
            uID         : result.user.uid
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        // replace text in the "signInContainer" element
        const signInContainer = document.getElementById('signInContainer');
        signInContainer.childNodes[1].nodeValue = `Hello, ${userInfo.displayName}`
        // replace event listener for the "signInButton" button
        const signInButton = document.getElementById('signInButton');
        signInButton.removeEventListener('click', signInWithMicrosoft);
        signInButton.addEventListener('click', signOut);

    }).catch((error) => {
        console.error(`Error when signing in with Microsoft: ${error}`);
    });
};

const auth = getAuth();

// Generic Sign-Out
export function signOutUser() {
    signOut(auth).then(() => {
        // Sign-out successful.
        console.log("User signed out successfully");
    }).catch((error) => {
        // An error happened.
        console.error("Sign out error", error);
    });
    localStorage.removeItem('userInfo');
    location.reload();
};

async function loadScores() {
    let userInfo = JSON.parse(localStorage.getItem("userInfo"));

    let uID = userInfo.uID;
    let deckName = getActiveStore().name;


    // Reference to the collection of all scores under a specific deckName for a user
    const scoresCollectionRef = collection(firestoreDatabase, "users", uID, deckName);
    // const scoreDocRef = doc(firestoreDatabase, "users", uID, deckName, "み");
      
    try {
        const querySnapshot = await getDocs(scoresCollectionRef);
        if (!querySnapshot.empty) {
            console.log(`Retrieved ${querySnapshot.docs.length} documents under Firestore scores for ${deckName}.`);
            querySnapshot.forEach(doc => {
                const data = doc.data();
                // console.log(`Document ID: ${doc.id}`, [data]);
                // Here you could aggregate data or update your application state/UI
                updateDeckScores(doc.id, [data]);
            });
        } else {
            console.log(`No documents found under deck: ${deckName}`);
        }
    } catch (error) {
        console.error("Error retrieving documents:", error);
    }
}

async function updateDeckScores(cardID, updates) {
    let objectStoreName = getActiveStore().name;

    return new Promise((resolve, reject) => {
        const connectionRequest = indexedDB.open(DB_NAME);

        connectionRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(objectStoreName, 'readwrite');
            const objectStore = transaction.objectStore(objectStoreName);

            // Handle updating each entry from updates array
            (async () => {
                for (const update of updates) {
                    try {
                        const index = objectStore.index("questionIndex");
                        const request = index.get(cardID);
                        await new Promise((resolve, reject) => {
                            request.onsuccess = (event) => {
                                const data = event.target.result;
                                if (data) {
                                    // Data exists, update it
                                    for (const key in update) {
                                        data[key] = update[key];
                                    }
                                    const updateRequest = objectStore.put(data);
                                    updateRequest.onsuccess = () => resolve();
                                    updateRequest.onerror = (e) => reject(e.target.error);
                                }
                            };
                            request.onerror = (e) => reject(e.target.error);
                        });
                    } catch (error) {
                        console.error("Failed to update an item:", error);
                        // Optionally, break out of the loop if a critical failure
                    }
                }
            })().then(() => {
                transaction.oncomplete = () => {
                    console.log(`'${objectStoreName}' deck updated in '${DB_NAME}'.`);
                    resolve(true);
                };
                transaction.onerror = (event) => {
                    console.error(`Error during transaction: ${event.target.error}`);
                    reject(false);
                };
            });
        };

        connectionRequest.onerror = (event) => {
            console.error(`Error when accessing '${DB_NAME}': ${event.target.error}`);
            reject(false);
        };

        connectionRequest.onupgradeneeded = (event) => {
            console.error("Database upgrade needed, this should be handled separately.");
            reject(false);
        };
    });
}
