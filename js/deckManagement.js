import { pageElements } from "./pageElements.js";

// Variables
export const DB_NAME = 'Decks';
let db_Version = parseInt(localStorage.getItem('db_Version')) || 1;

export var currentCard;
export var availableStores = JSON.parse(localStorage.getItem('availableStores')) || [];
export var activeStore = getActiveStore();

// Functions
export async function loadDecks(
    uiElements = pageElements.uiElements
) {
    let decksAreAvailable = false;

    while (decksAreAvailable === false) {
        try {
            let result = await queryIndexedDB();
            console.log(result.responseMessage);

            // Check if 'availableStores' is properly initialized and populated
            if (!availableStores.length || availableStores.some(store => store.cardCount === 0)) {
                await populateDecks();
            }

            decksAreAvailable = true;

        } catch (error) {
            console.log(error.responseMessage);
            await createObjectStores(['Hiragana', 'Katakana'], { keyPath: 'id', autoIncrement: true });
            await populateDecks();
        }

        if (getActiveStore() === null && availableStores.length > 0) {
            setActiveStore(availableStores[0].name);
            decksAreAvailable = true;
        }
    }

    await displayRandomFlashcard();

};

async function queryIndexedDB() {
    return new Promise((resolve, reject) => {
        // establish a connection request against "DB_NAME"
        const connectionRequest = indexedDB.open(DB_NAME);

        // handle successful connections against "DB_NAME"
        connectionRequest.onsuccess = (event) => {
            const databaseConnection = event.target.result;
            // close the database connection against "DB_NAME"
            databaseConnection.close();
            resolve({ responseMessage: `DATABASE CONNECTION SUCCESSFUL` });
        };

        // handle failed connections against "DB_NAME"
        connectionRequest.onerror = () => {
            reject({ responseMessage: `DATABASE CONNECTION ERROR` });
        };

        // handle necessary database creation, or upgrades, for "DB_NAME"
        connectionRequest.onupgradeneeded = () => {
            reject({ responseMessage: `'${DB_NAME}' DATABASE CREATED` });
        };
    });
};

async function createObjectStores(storeNames, options) {
    // increment 'db_Version' to trigger the "onUpgradeNeeded" event
    db_Version += 1;
    localStorage.setItem('db_Version', db_Version);

    return new Promise((resolve, reject) => {
        // establish a connection request against "DB_NAME"
        const connectionRequest = indexedDB.open(DB_NAME, db_Version);

        // handle successful connections against "DB_NAME"
        connectionRequest.onsuccess = (event) => {
            const databaseConnection = event.target.result;
            // close the database connection against "DB_NAME"
            databaseConnection.close();
            reject({ response: `DATABASE CONNECTION SUCCESSFUL` });
        };

        // handle failed connections against "DB_NAME"
        connectionRequest.onerror = (event) => {
            console.error(`Error when accessing '${DB_NAME}': ${event.target.error})`);
            // terminate the Promise with a rejection
            reject({ response: `DATABASE CONNECTION ERROR` });
        };

        // handle database creation or upgrades issued against "DB_NAME"
        connectionRequest.onupgradeneeded = async (event) => {
            const databaseConnection = event.target.result;

            storeNames.forEach(async (storeName) => {
                if (!databaseConnection.objectStoreNames.contains(storeName)) {
                    // create a new 'objectStore'
                    const objectStore = databaseConnection.createObjectStore(storeName, options);
                    // create Indexes
                    ['question', 'answer', 'correctGuesses', 'incorrectGuesses', 'ratio'].forEach(element => {
                        objectStore.createIndex(`${element}Index`, element, { unique: false });
                    });

                    console.log(`'${storeName}' deck created under '${DB_NAME}'.`);

                    // push 'storeName' into the 'availableStores' array
                    console.log(`'${storeName}' deck added to 'availableStores' array in localStorage.`)
                    availableStores.push({ "name": `${storeName}`, cardCount: 0 })

                    // update the 'availableStores' array in localStorage
                    localStorage.setItem(
                        'availableStores',
                        JSON.stringify(availableStores)
                    );
                } else {
                    console.log(`'${storeName}' deck found under '${DB_NAME}'.`);
                }
            });
        };
        // terminate the Promise with a resolution
        resolve(true);
    });
};

async function populateDecks(
    availableStores = (JSON.parse(localStorage.getItem('availableStores')) || [])
) {
    let deckPopulationPromises = availableStores.map(async (store) => {
        return new Promise((resolve, reject) => {
            // establish a connection request against "DB_NAME"
            const connectionRequest = indexedDB.open(DB_NAME);

            // handle successful connections against "DB_NAME"
            connectionRequest.onsuccess = (event) => {
                const databaseConnection = event.target.result;
                const readOnlyTransaction = databaseConnection.transaction(store.name, 'readonly');
                const objectStore = readOnlyTransaction.objectStore(store.name);

                objectStore.getAll().onsuccess = (event) => {
                    if (event.target.result.length === 0) {
                        fetch(`../FlashcardHub/Decks/${store.name}.js`)
                            .then(httpResponse => httpResponse.json())
                            .then(jsonData => {
                                const readWriteTransaction = databaseConnection.transaction(store.name, 'readwrite');
                                const writeObjectStore = readWriteTransaction.objectStore(store.name);

                                (async () => {
                                    for (const item of jsonData) {
                                        await writeObjectStore.add(item);
                                    }
                                })();

                                // handle successful transacions against "store.Name"
                                readWriteTransaction.oncomplete = () => {
                                    resolve({ responseMessage: `'${store.name}' deck populated under '${DB_NAME}'.` });
                                };

                                // handle failed connections against "store.Name"
                                readWriteTransaction.onerror = event => {
                                    reject({ responseMessage: `Couldn't write items into the '${store.name}' deck stored under '${DB_NAME}': ${event.target.error}` });
                                };
                            })
                            .catch(error => {
                                reject({ responseMessage: `Error when retrieving items under '${DB_NAME}': ${error}` });
                            });
                    } else {
                        console.log(`'${store.name}' deck is already populated.`);
                        resolve({ responseMessage: `'${store.name}' deck already populated '${DB_NAME}'.` });
                    }
                };
            };

            // handle failed connections against "DB_NAME"
            connectionRequest.onerror = () => {
                reject({ responseMessage: `DATABASE CONNECTION ERROR` });
            };

            // handle necessary database creation, or upgrades, for "DB_NAME"
            connectionRequest.onupgradeneeded = () => {
                reject({ responseMessage: `DATABASE UPGRADE REQUIRED` });
            };
        });
    })

    Promise.all(deckPopulationPromises)
        .then(() => {
            return ({ responseMessage: `Decks Populated Successfully` });
        })
        .catch(error => {
            return ({ responseMessage: `Decks Population Failed - ERROR: '${error.message}'` });
        });
};

export function getActiveStore() {
    let activeStore = localStorage.getItem('activeStore') || null;
    return (activeStore === null) ? null : activeStore;
};

export function setActiveStore(storeName) {
    localStorage.setItem('activeStore', storeName);
    pageElements.uiElements.cardHeader.textContent = storeName;
};

export async function displayRandomFlashcard(
    activeStore = getActiveStore()
) {
    return new Promise((resolve, reject) => {
        // establish a connection against "DB_NAME"
        const databaseConnection = indexedDB.open(DB_NAME);

        // handle successful connections against "DB_NAME"
        databaseConnection.onsuccess = (event) => {
            const database = event.target.result;
            const readOnlyTransaction = database.transaction(activeStore, 'readonly');
            const objectStore = readOnlyTransaction.objectStore(activeStore);

            // retrieve all items from the Active Deck store
            objectStore.getAll().onsuccess = (event) => {
                const retrievedFlashcards = event.target.result;

                if (retrievedFlashcards.length > 0) {
                    // select a random flashcard from the the Active Deck store
                    const randomIndex = Math.floor(Math.random() * retrievedFlashcards.length); // 5
                    currentCard = retrievedFlashcards[randomIndex];

                    const faceText = document.getElementById("cardFace");
                    faceText.textContent = `${currentCard.question}`;
                    document.getElementById("correctGuesses").textContent = `✔️ ${currentCard.correctGuesses}`;
                    document.getElementById("incorrectGuesses").textContent = `❌ ${currentCard.incorrectGuesses}`;
                    document.getElementById("percentageRatio").textContent = `🎯 ${calculateCorrectGuessRatio(currentCard.correctGuesses, currentCard.incorrectGuesses)}%`;



                    // close the database connection against "DB_NAME"
                    database.close();

                    // clear the 'userInput' element
                    document.getElementById('inputField').value = "";
                    document.getElementById('inputField').disabled = false;

                    resolve(currentCard);

                } else {
                    console.error(`Couldn't retrieve any flashcard from "${DB_NAME}/${activeStore.name}".`);
                }
            }

        };
        // handle failed connections against "DB_NAME"
        databaseConnection.onerror = function (event) {
            console.error(`Error when accessing '${DB_NAME}': ${event.target.error})`);
            reject(false);
        };

        // handle database creation or upgrades issued against "DB_NAME"
        databaseConnection.onupgradeneeded = function (event) {
            reject(false);
        };
    });
};

// calculate the ratio of "correctGuesses" vs "incorrectGuesses"
export function calculateCorrectGuessRatio(correctGuesses, incorrectGuesses) {
    const guessRatio = (incorrectGuesses === 0 && correctGuesses > 0) ?
        100 :
        (correctGuesses / (correctGuesses + incorrectGuesses)) * 100;

    return (isNaN(guessRatio)) ?
        0 :
        guessRatio.toFixed(0);
}