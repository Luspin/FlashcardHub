import { pageElements } from "./pageElements.js";
import { getActiveStore } from "./userPreferences.js";
import { createObjectStore } from './indexedDbOperations.js';
import { DB_NAME } from './indexedDbOperations.js';

export var currentCard;

// Functions
export async function displayRandomFlashcard(activeStore) {
    if (activeStore === undefined || activeStore === null) {
        console.error(`Couldn't retrieve an 'activeStore' from localStorage.`);
        return null;
    }

    // clear the 'userInput' element
    document.getElementById('inputField').value = "";

    return new Promise((resolve, reject) => {
        // establish a connection against "DB_NAME"
        const openRequest = indexedDB.open(DB_NAME);

        // handle successful connections against "DB_NAME"
        openRequest.onsuccess = function (event) {
            const database = event.target.result;
            const readOnlyTransaction = database.transaction(getActiveStore().name, 'readonly');
            const objectStore = readOnlyTransaction.objectStore(activeStore.name);

            // retrieve all items from the Active Deck store
            objectStore.getAll().onsuccess = (event) => {
                const retrievedFlashcards = event.target.result;

                if (retrievedFlashcards.length > 0) {
                    // select a random flashcard from the the Active Deck store
                    const randomIndex = Math.floor(Math.random() * retrievedFlashcards.length); // 5
                    currentCard = retrievedFlashcards[randomIndex];

                    const faceText = document.getElementById("cardFace");
                    faceText.textContent = `${currentCard.question}`;
                    document.getElementById("correctGuesses").textContent = `✔️ ${currentCard.correctGuesses}`;
                    document.getElementById("incorrectGuesses").textContent = `❌ ${currentCard.incorrectGuesses}`;
                    document.getElementById("percentageRatio").textContent = `🎯 ${calculateCorrectGuessRatio(currentCard.correctGuesses, currentCard.incorrectGuesses)}%`;

                    // calculate the ratio of "correctGuesses" vs "incorrectGuesses"
                    function calculateCorrectGuessRatio(correctGuesses, incorrectGuesses) {
                        const guessRatio = (incorrectGuesses === 0 && correctGuesses > 0) ?
                            100 :
                            (correctGuesses / (correctGuesses + incorrectGuesses)) * 100;

                        return (isNaN(guessRatio)) ?
                            0 :
                            guessRatio.toFixed(0);
                    }

                    // close the database connection against "DB_NAME"
                    database.close();
                    resolve(currentCard);

                } else {
                    console.error(`Couldn't retrieve any flashcard from "${DB_NAME}/${activeStore.name}".`);
                    createObjectStore([activeStore.name]);
                    displayRandomFlashcard(activeStore);
                    // reactivate the 'inputField' element
                    pageElements.uiElements.inputField.disabled = false;
                }
            }

        };
        // handle failed connections against "DB_NAME"
        openRequest.onerror = function (event) {
            console.error(`Error when accessing '${DB_NAME}': ${event.target.error})`);
            reject(false);
        };

        // handle database creation or upgrades issued against "DB_NAME"
        openRequest.onupgradeneeded = function (event) {
            reject(false);
        };
    });
};
