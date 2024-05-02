import { loadDecks } from "./deckManagement.js";
import { toggleSettingsOverlay } from "./settingsOverlay.js";
import { togglePageTheme } from "./pageThemes.js";
import { microsoftSignIn, signOut } from "./Firebase/authentication.js";
import { evaluateAnswer } from './userInput.js';
import { firebaseUser } from "./userPreferences.js";

export const loadEventListeners = () => {
    // DOMContentLoaded
    document.addEventListener('DOMContentLoaded', loadDecks);
    // Settings Button
    settingsButton.addEventListener('click', toggleSettingsOverlay);
    // Theme Toggle Button
    themeToggleButton.addEventListener('click', togglePageTheme);
    // Deck Toggle Button
    deckToggleButton.addEventListener('click', function() { /* TODO */ });
    // Sign-In Button
    if (firebaseUser)
        signInButton.addEventListener('click', signOut);
    else
        signInButton.addEventListener('click', microsoftSignIn);
    // User Input Field
    inputField.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault(); // prevent any default action triggered by the 'Enter' key
            evaluateAnswer(inputField.value);
        }
    });
};
