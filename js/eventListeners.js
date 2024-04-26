import { pageElements } from "./pageElements.js";
import { toggleSettingsOverlay } from "./settingsOverlay.js";
import { togglePageTheme } from "./pageThemes.js";
import { signInWithMicrosoft } from "./Firebase/authServices.js";
import { checkAnswer, recordAnswer } from './userInput.js';
import { queryIndexedDB, DB_NAME, createObjectStore } from './indexedDbOperations.js';
import { activeStore, getActiveStore, setActiveStore } from './userPreferences.js';
import { displayRandomFlashcard } from './deckOperations.js';

export async function addEventListeners(
    secondaryElements = pageElements.secondaryElements,
    uiElements = pageElements.uiElements
) {
    // Settings Button
    uiElements.settingsButton
        .addEventListener('click', toggleSettingsOverlay);
    // Theme Toggle Button
    uiElements.themeToggleButton
        .addEventListener('click', togglePageTheme);
    // Sign-In Button
    uiElements.signInButton
        .addEventListener('click', signInWithMicrosoft);
    // User Input Field
    uiElements.inputField
        .addEventListener('keydown', keyEvent => {
            if (keyEvent.key === 'Enter') {
                keyEvent.preventDefault(); // prevent any default action triggered by the 'Enter' key
                checkAnswer(uiElements.inputField.value)
                .then((result) => { recordAnswer(result) });
            }
        });
    // DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        // temporarily deactivate the 'inputField' element
        uiElements.inputField.disabled = true;

        queryIndexedDB(true)
        .then(async (result) => {
            if (result.availableDecks.length === 0) {
                console.error(`No decks found within the '${DB_NAME}' database.`);
            }

            if (result.availableStores.length === 0) {
                await createObjectStore(['Hiragana', 'Katakana'])
                .then(async (result) => {
                    if (result === true) {
                        setActiveStore("Hiragana");
                        await displayRandomFlashcard(getActiveStore());
                        // reactivate the 'inputField' element
                        uiElements.inputField.disabled = false;
                    } else {
                        console.error(`Failed to create Decks.`);
                    }
                 });
            };
        })

        if (activeStore) {
            displayRandomFlashcard(getActiveStore());
            // reactivate the 'inputField' element
            uiElements.inputField.disabled = false;
        } else {
            console.log("Couldn't retrieve an 'activeStore' from localStorage.");
        }
    });
}