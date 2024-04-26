import { pageElements } from "./pageElements.js";
import { signInWithMicrosoft, signOutUser } from "./Firebase/authServices.js";
import { restorePageTheme } from "./pageThemes.js";

export var activeStore = getActiveStore();
export const userInfo = (JSON.parse(localStorage.getItem('userInfo')) || undefined);

// Functions
export function loadUserPreferences() {
    restoreUserInfo();
    restorePageTheme();
}

function restoreUserInfo() {
    if (userInfo) {
        // replace text in the "signInContainer" element
        const signInContainer = document.getElementById('signInContainer');
        signInContainer.childNodes[1].nodeValue = `Hello, ${userInfo.displayName}`;
        // replace event listener for the "signInButton" button
        const signInButton = document.getElementById('signInButton');
        signInButton.removeEventListener('click', signInWithMicrosoft);
        signInButton.addEventListener('click', signOutUser);
    };
}

export function getActiveStore() {
    return (JSON.parse(localStorage.getItem('activeStore')) || undefined);
}

export function setActiveStore(storeName) {
    localStorage.setItem('activeStore', JSON.stringify({ name: storeName }));
    pageElements.uiElements.cardHeader.textContent = storeName;
}