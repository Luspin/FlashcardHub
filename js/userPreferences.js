import { restorePageTheme } from "./pageThemes.js";

// Variables
export const firebaseUser = (JSON.parse(localStorage.getItem("firebaseUser")) || undefined);

// Functions
export const loadUserPreferences = () => {
    restorePageTheme();
};
