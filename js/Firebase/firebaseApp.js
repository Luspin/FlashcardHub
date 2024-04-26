import { firebaseConfig } from "./firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Retrieve Firestore Database
export const firestoreDatabase = getFirestore(firebaseApp);