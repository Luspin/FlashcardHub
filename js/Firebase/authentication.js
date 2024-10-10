import { getAuth, OAuthProvider, onAuthStateChanged, signInWithPopup as firebaseSignIn, signOut as firebaseSignOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { pageElements } from "pageElements.js";
import { firebaseApp } from "./firebaseApp.js";
import { retrieveUserScores } from "./firestore.js";

export const firebaseAuth = getAuth(firebaseApp);

const authProviders = [
    (new OAuthProvider('microsoft.com'))
];

onAuthStateChanged(firebaseAuth, async (userImpl) => {
    if (userImpl) {
        console.log(`Signed in as '${userImpl.displayName}'.`);
        // replace text in the "signInContainer" element
        const signInContainer = pageElements.uiElements.signInContainer;
        signInContainer.childNodes[1].nodeValue = `Hello, ${userImpl.displayName}`
        // replace event listener for the "signInButton" button
        const signInButton = pageElements.uiElements.signInButton;
        signInButton.removeEventListener('click', microsoftSignIn);
        signInButton.addEventListener('click', signOut);
        try {
            await retrieveUserScores(userImpl.uid);
        } catch (error) {
            console.error(`Error: '${error}'`);
        }
    } else {
        console.log(`No user found.`);
    }
});

// Microsoft Sign-In
export const microsoftSignIn = () => {
    firebaseSignIn(firebaseAuth, authProviders[0])
    .then((result) => {
        localStorage.setItem(
            'firebaseUser',
            JSON.stringify({
                displayName: result.user.displayName,
                uID: result.user.uid
            })
        );
    }).catch((error) => {
        console.error(`Error: '${error}'`);
    });
};

// Generic Sign-Out
export const signOut = () => {
    firebaseSignOut(firebaseAuth).then(() => {
        localStorage.removeItem('firebaseUser');
        location.reload();
    }).catch((error) => {
        console.error(`Error: '${error}'`);
    });
};
