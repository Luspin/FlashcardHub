import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// for Firebase JS SDK v7.20.0+, "measurementId" is optional
const firebaseConfig = {
    apiKey            : "AIzaSyDzXgMdpDs9mj455zfD348PVXCmQ6g2Do0",
    appId             : "1:118661407631:web:1170ee8069d582dd4b21fa",
    authDomain        : "fshub-36f76.firebaseapp.com",
    measurementId     : "G-J548BT0P4N",
    messagingSenderId : "118661407631",
    projectId         : "fshub-36f76",
    storageBucket     : "fshub-36f76.appspot.com"
};

// initialize the Firebase App
export const firebaseApp = initializeApp(firebaseConfig);
