import { pageElements } from "./pageElements.js";

export function loadStylesheets() {
    // local CSS resources
    createCSSLinkFrom('../css/main.css');
    // external CSS resources
    createCSSLinkFrom('https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css');
}

function createCSSLinkFrom(sourceUri) {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.type = "text/css";
    linkElement.href = sourceUri;
    document.head.appendChild(linkElement);
}

export function loadPageElements(primaryElements = pageElements.primaryElements) {
    // iterate over the primaryElements collection
    Object.keys(primaryElements).forEach(elementKey => {
        const primaryElement = document.body.appendChild(primaryElements[elementKey]);
        // append any necessary childElements
        appendChildElements(primaryElement);
    });
};

function appendChildElements(
    primaryElement,
    secondaryElements = pageElements.secondaryElements,
    uiElements = pageElements.uiElements
) {
    switch (primaryElement.id) {
        case "pageHeader":
            const pageHeaderTable = primaryElement.appendChild(secondaryElements.pageHeaderTable);
            // Settings Button
            pageHeaderTable.rows[0].insertCell(-1)
                .appendChild(uiElements.settingsButton)
                .appendChild(uiElements.settingsIcon);
            // Theme Toggle Button
            pageHeaderTable.rows[0].insertCell(-1)
                .appendChild(uiElements.themeToggleButton)
                .appendChild(uiElements.themeToggleIcon);
            // Expanding Cell
            pageHeaderTable.rows[0]
                .appendChild(uiElements.expandingCell.cloneNode(true));
                // copies the "expandingCell" element
            // Sign-In Button
            const signInButton = pageHeaderTable.rows[0].insertCell(-1).appendChild(uiElements.signInButton);
            // Sign-In Container
            const signInContainer = signInButton.appendChild(uiElements.signInContainer);
            signInContainer.appendChild(uiElements.microsoftLogo);
            signInContainer.appendChild(document.createTextNode("Sign in with Microsoft"));
            break;
        case "pageMain":
            // Card Container
            const cardContainer = primaryElement.appendChild(uiElements.cardContainer);
            // Card Header
            cardContainer.appendChild(uiElements.cardHeader);
            // Card Face
            cardContainer.appendChild(uiElements.cardFace);
            // Card Footer
            const cardFooter = cardContainer.appendChild(uiElements.cardFooter);
            // Card Footer Table
            const cardFooterTable = cardFooter.appendChild(uiElements.cardFooterTable);
            (cardFooterTable.rows[0].insertCell(-1)).id = "correctGuesses";
            (cardFooterTable.rows[0].insertCell(-1)).id = "incorrectGuesses";
            cardFooterTable.rows[0].appendChild(uiElements.expandingCell.cloneNode(true)); // copies the "expandingCell" element
            (cardFooterTable.rows[0].insertCell(-1)).id = "percentageRatio";
            // User Input Field
            primaryElement.appendChild(uiElements.inputField);
            // Settings Overlay
            primaryElement
                .appendChild(secondaryElements.settingsOverlay)
                .appendChild(uiElements.overlayHeader)
            break;
        case "pageFooter":
            break;
    }
}