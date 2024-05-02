export const toggleSettingsOverlay = () => {
    [ settingsDismisser, settingsOverlay ].forEach((element) => {
        element.classList.toggle("visible");
    });

    settingsDismisser.addEventListener("click", () => {
        [ settingsDismisser, settingsOverlay ].forEach((element) => {
            element.classList.remove("visible");
        });
    });
}