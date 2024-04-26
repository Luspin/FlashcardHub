import { currentCard, displayRandomFlashcard } from "./deckOperations.js";
import { getActiveStore, userInfo } from "./userPreferences.js";
import { firestoreDatabase } from "./Firebase/firebaseApp.js";
import { doc, setDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { DB_NAME } from './indexedDbOperations.js';

export async function checkAnswer(userInput) {
    console.log(currentCard);
    return new Promise((resolve, reject) => {
        // establish a connection against "DB_NAME"
        const openRequest = indexedDB.open(DB_NAME);
        // handle successful connections against "DB_NAME"
        openRequest.onsuccess = (event) => {
            const databaseConnection = event.target.result;
            // create a read-write transaction for the Active Deck store
            const readOnlyTransaction = databaseConnection.transaction(getActiveStore().name, 'readonly');
            const objectStore = readOnlyTransaction.objectStore(getActiveStore().name);

            if (userInput.toLowerCase() == currentCard.answer) {
                document.getElementById("cardFace").textContent = `${currentCard.answer}`;
                animateFlashcard(true);
                currentCard.correctGuesses++;
                document.getElementById("correctGuesses").textContent = `✔️ ${currentCard.correctGuesses}`;
            }
            else {
                document.getElementById("cardFace").textContent = `${currentCard.answer}`;
                animateFlashcard(false);
                currentCard.incorrectGuesses++;
                document.getElementById("incorrectGuesses").textContent = `❌ ${currentCard.incorrectGuesses}`;
            }

            // close the databaseConnection connection against "DB_NAME"
            databaseConnection.close();
            resolve(true);

        };

        openRequest.onerror = () => {
            // console.error(`Error updating card statistics in "${activeDeck}".`);
        };
    });

}

export async function recordAnswer(result) {
    return new Promise((resolve, reject) => {
        // establish a connection against "DB_NAME"
        const openRequest = indexedDB.open(DB_NAME);
        // handle successful connections against "DB_NAME"
        openRequest.onsuccess = function (event) {
            const database = event.target.result;
            // create a read-write transaction for the Active Deck store
            const readWriteTransaction = database.transaction(getActiveStore().name, 'readwrite');
            const objectStore = readWriteTransaction.objectStore(getActiveStore().name);
            const updateRequest = objectStore.put(currentCard);

            updateRequest.onsuccess = () => {
                console.log(`Card statistics updated in "${DB_NAME}/${getActiveStore().name}"`);

                if (localStorage.getItem("userInfo")) {
                    const userResponse = {
                        "cardID" : currentCard.id,
                        "question" : currentCard.question,
                        "answer" : currentCard.answer,
                        "correctGuesses": (currentCard.correctGuesses || 0),
                        "incorrectGuesses": (currentCard.incorrectGuesses || 0),
                    };
                    uploadScoresToFirebase(userResponse);
                }

                // close the database connection against "DB_NAME"
                database.close();
                resolve(true);
            };
        
            updateRequest.onerror = () => {
                console.error(`Error updating card statistics in "${getActiveStore().name}".`);
                database.close();
                resolve(false);
            };
        };

        openRequest.onerror = () => {
            console.error(`Error updating card statistics in "${getActiveStore().name}".`);
        };
    });
}

function animateFlashcard(isCorrect) {
    if (isCorrect) {
        // Pastel green
        document.getElementById("cardContainer").style.backgroundColor = '#b2fab4';
    } else {
        // Pastel red
        document.getElementById("cardContainer").style.backgroundColor = '#ffb3ba';
    }

    // Optional: Reset the background color after a short delay
    setTimeout(() => {
        document.getElementById("cardContainer").style.backgroundColor = '';
        displayRandomFlashcard(getActiveStore()); // Resets to default
    }, 2000); // Adjust the time as needed
};

async function uploadScoresToFirebase(userResponse) {
    // Reference to the user's specific document
    const userDocRef = doc(firestoreDatabase, "users", userInfo.uID);
    // Reference to the subcollection 'flashcardScores' within the user's document
    const deckRef = collection(userDocRef, getActiveStore().name);
    // Specific flashcard score document reference
    const scoreDocRef = doc(deckRef, userResponse.question); // Use the question as the document ID


    try {
        // Update only the specified fields in the document
        await setDoc(scoreDocRef, {
            correctGuesses: userResponse.correctGuesses,
            incorrectGuesses: userResponse.incorrectGuesses
        }, { merge: true }); // Using merge to update fields without overwriting the entire document

        console.log("Flashcard score successfully updated for user:", userInfo.uID);
    } catch (error) {
        console.error("Error updating flashcard score for user:", userInfo.uID, error);
    }
  }