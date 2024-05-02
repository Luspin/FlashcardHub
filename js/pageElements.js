// Fluent UI Icons
// https://developer.microsoft.com/en-us/fluentui#/styles/web/icons
export const pageElements = {
    "primaryElements"   : {
        pageHeader        : createHtmlElement("header", { "id": "pageHeader" }),
        pageMain          : createHtmlElement("main", { "id": "pageMain" }),
        pageFooter        : createHtmlElement("footer", { "id": "pageFooter" })
    },
    "secondaryElements" : {
        pageHeaderTable   : createTable("pageHeaderTable"),
        settingsDismisser : createHtmlElement("div", { "id": "settingsDismisser" }),
        settingsOverlay   : createFluentWebComponent(
                                "fluent-card",
                                {
                                    "id"          : "settingsOverlay",
                                    "hidden"      : true
                                }
                            ),
        settingsTable     : createTable("settingsTable", 2)
    },
    "uiElements"        : {
        settingsButton    : createFluentWebComponent(
                                "fluent-button",
                                {
                                    "id"          : "settingsButton",
                                    "appearance"  : "neutral"
                                }
                            ),
        settingsIcon      : createHtmlElement(
                                "i",
                                {
                                    "id"            : "settingsIcon",
                                    "class"         : "ms-Icon ms-Icon--Settings"
                                }
                            ),
        themeToggleButton : createFluentWebComponent(
                                "fluent-button",
                                {
                                    "id"            : "themeToggleButton",
                                    "appearance"    : "neutral"
                                }
                            ),
        themeToggleIcon   : createHtmlElement(
                                "i",
                                {
                                    "id"            : "themeToggleIcon",
                                    "class"         : "ms-Icon ms-Icon--Light"
                                }
                            ),
        deckToggleButton  : createFluentWebComponent(
                                "fluent-button",
                                {
                                    "id"            : "deckToggleButton",
                                    "appearance"    : "neutral"
                                }
                            ),
        expandingCell     : createHtmlElement("td", { "id"  : "expandingCell" }),
        signInButton      : createFluentWebComponent(
                                "fluent-button",
                                {
                                    "id"          : "signInButton",
                                    "appearance"  : "neutral",
                                }
                            ),
        signInContainer   : createHtmlElement("div", { "id" : "signInContainer" }),
        microsoftLogo     : createHtmlElement(
                                "img",
                                {
                                    "id"            : "microsoftLogo",
                                    "src"           : "../FlashcardHub/media/images/microsoftLogo.svg",
                                }
                            ),
        cardContainer     : createFluentWebComponent("fluent-card", { "id" : "cardContainer" }),
        cardHeader        : createHtmlElement(
                                "h4",
                                {
                                    "id"            : "cardHeader"
                                }
                            ),
        cardFace          : createHtmlElement("h1", { "id"  : "cardFace" }),
        cardFooter        : createHtmlElement("div", { "id" : "cardFooter" }),
        cardFooterTable   : createTable("cardFooterTable"),
        inputField        : createFluentWebComponent(
                                "fluent-text-field",
                                {
                                    "id"          : "inputField",
                                    "placeholder" : "Type rōmaji here…",
                                    "disabled"    : true
                                }
                            ),
        overlayHeader     : createHtmlElement(
                                "h4",
                                {
                                    "id"          : "overlayHeader",
                                    "textContent" : "Settings"
                                }
                            )
    }
};

function createTable(tableName, tableRowCount = 1) {
    const table = document.createElement('table');
    table.setAttribute('id', tableName);
    // Create an Array of anonymous table rows the size of "tableRowCount"
    createTableRows(tableRowCount).forEach(tableRow => table.appendChild(tableRow));
    return table;
};

function createTableRows(tableRowCount = 1) {
    return Array.from({ length: tableRowCount }, () => document.createElement('tr'));
};

function createHtmlElement(elementType = null, elementProperties = { "id": null }) {
    const htmlElement = document.createElement(elementType);

    Object.entries(elementProperties).forEach(([key, value]) => {
        (key in htmlElement) ?
        htmlElement[key] = value // if 'key' is a direct Property of the element, set it…
        : htmlElement.setAttribute(key, value); // …otherwise, assume it's an Attribute and set it.
    });

    return htmlElement;
};

function createFluentWebComponent(componentType = null, componentProperties = { "id": null }, componentText = "") {
    const uiElement = document.createElement(componentType);

    Object.entries(componentProperties).forEach(([key, value]) => {
        (key in uiElement) ?
        uiElement[key] = value // if 'key' is a direct Property of the element, set it…
        : uiElement.setAttribute(key, value); // …otherwise, assume it's an Attribute and set it.
    });

    return uiElement;
};
