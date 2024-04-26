import {
    baseLayerLuminance,
    StandardLuminance
} from "https://unpkg.com/@fluentui/web-components";

// define a 'baseLayer' constant
const baseLayer = document.body;

// define a 'pageThemes' object
const pageThemes = {
    "Light": {
        "luminanceMode": StandardLuminance.LightMode,
        "nextLuminanceMode": StandardLuminance.DarkMode,
        "nextTheme": "Dark"
    },
    "Dark": {
        "luminanceMode": StandardLuminance.DarkMode,
        "nextLuminanceMode": StandardLuminance.LightMode,
        "nextTheme": "Light"
    }
};

export function restorePageTheme(
    eventDispatcher,
    currentTheme = (localStorage.getItem("currentTheme") || undefined)
) {
    switch (currentTheme) {
        case "Dark": {
            baseLayer.classList.toggle("darkTheme", true);
            baseLayerLuminance.setValueFor(baseLayer, pageThemes[currentTheme].luminanceMode);
            break;
        }
        default: {
            localStorage.setItem("currentTheme", "Light");
            break;
        }
    }
}

export function togglePageTheme(
    eventDispatcher,
    currentTheme = (localStorage.getItem("currentTheme") || undefined)
) {
    switch (currentTheme) {
        case "Light": {
            baseLayer.classList.toggle("darkTheme", true);
            baseLayerLuminance.setValueFor(baseLayer, pageThemes[currentTheme].nextLuminanceMode);
            localStorage.setItem("currentTheme", "Dark");
            break;
        }
        case "Dark": {
            baseLayer.classList.toggle("darkTheme", false);
            baseLayerLuminance.setValueFor(baseLayer, pageThemes[currentTheme].nextLuminanceMode);
            localStorage.setItem("currentTheme", "Light");
            break;
        }
    }
}