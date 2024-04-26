// Variables
export const DB_NAME = 'Decks';
let availableStores = JSON.parse(localStorage.getItem('availableStores')) || [];
let db_Version = parseInt(localStorage.getItem('db_Version')) || 1;

// Functions
// Returns a list of all available decks stored under "DB_NAME"
export async function queryIndexedDB(listStores = false) {
    return new Promise((resolve, reject) => {
        // establish a connection request against "DB_NAME"
        const connectionRequest = indexedDB.open(DB_NAME);

            // handle successful connections against "DB_NAME"
            connectionRequest.onsuccess = (event) => {
                const databaseConnection = event.target.result;
                const availableDecks = Array.from(databaseConnection.objectStoreNames);

                if (listStores) {
                    resolve({ availableDecks, availableStores });
                } else {
                    reject({ availableDecks, availableStores });
                }

                // close the databaseConnection connection against "DB_NAME"
                databaseConnection.close();
            };

            // handle failed connections against "DB_NAME"
            connectionRequest.onerror = (event) => {
                console.error(`Couldn't retrieve the '${database.name}' database from IndexedDB.`);
            };

            // handle database creation or upgrades for "DB_NAME"
            connectionRequest.onupgradeneeded = () => {
                console.log(`'${DB_NAME}' database needs to be created or upgraded.`);
            };
    });
};

export async function createObjectStore(
    objectStoreNames,
    options = { keyPath: 'id', autoIncrement: true }
) {
    // increment version to trigger the "onupgradeneeded" event
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
            };

            // handle failed connections against "DB_NAME"
            connectionRequest.onerror = (event) => {
                console.error(`Error when accessing '${DB_NAME}': ${event.target.error})`);
                // terminate the Promise with a rejection
                reject(false);
            };

            // handle database creation or upgrades issued against "DB_NAME"
            connectionRequest.onupgradeneeded = async (event) => {
                const databaseConnection = event.target.result;

                objectStoreNames.forEach(async (storeName) => {
                    if (!databaseConnection.objectStoreNames.contains(storeName)) {
                        // create a new objectStore
                        const objectStore = databaseConnection.createObjectStore(storeName, options);
                        // create Indexes
                        ['question', 'answer', 'correctGuesses', 'incorrectGuesses', 'ratio'].forEach(element => {
                            objectStore.createIndex(`${element}Index`, element, { unique: false });
                        });

                        console.log(`'${storeName}' deck created under '${DB_NAME}'.`);
                        availableStores.push(storeName);
                        localStorage.setItem('availableStores', JSON.stringify(availableStores));

                        // populate the Deck
                        await populateDeck(storeName);
                    } else {
                        console.log(`'${storeName}' deck found under '${DB_NAME}'.`);
                    }
                });
            };
            // terminate the Promise with a resolution
            resolve(true);
    });
};

async function populateDeck(objectStoreName) {
    return new Promise((resolve, reject) => {
        // establish a connection request against "DB_NAME"
        const connectionRequest = indexedDB.open(DB_NAME);

            // handle successful connections against "DB_NAME"
            connectionRequest.onsuccess = (event) => {
                const databaseConnection = event.target.result;
                const readOnlyTransaction = databaseConnection.transaction(objectStoreName, 'readonly');
                const objectStore = readOnlyTransaction.objectStore(objectStoreName);

                objectStore.getAll().onsuccess = (event) => {
                    if (event.target.result.length === 0) {
                        fetch(`../Decks/${objectStoreName}.js`)
                            .then(httpResponse => httpResponse.json())
                            .then(jsonData => {
                                const readWriteTransaction = databaseConnection.transaction(objectStoreName, 'readwrite');
                                const writeObjectStore = readWriteTransaction.objectStore(objectStoreName);

                                // Example using async/await with for...of loop
                                (async () => {
                                    for (const item of jsonData) {
                                        writeObjectStore.add(item); // Ensure this is awaited or handled correctly if it's asynchronous
                                    }
                                })();

                                // handle successful transacions against "activeStore"
                                readWriteTransaction.oncomplete = () => {
                                    console.log(`'${objectStoreName}' deck populated under '${DB_NAME}'.`);
                                    resolve(true);
                                };

                                // handle failed connections against "activeStore"
                                readWriteTransaction.onerror = event => {
                                    console.error(`Couldn't write items to the '${objectStoreName}' deck stored under '${DB_NAME}': ${event.target.error}`);
                                    reject(false);
                                };
                            })
                            .catch(error => {
                                console.error(`Error when retrieving items under '${DB_NAME}': ${error}`);
                                reject(false);
                            });
                    } else {
                        console.log(`'${objectStoreName}' deck is already populated.`);
                        resolve(true);
                    }
                };
            };

            // handle failed connections against "DB_NAME"
            connectionRequest.onerror = (event) => {
                console.error(`Error when accessing '${DB_NAME}': ${event.target.error})`);
                // terminate the Promise with a rejection
                reject(false);
            };

            // handle database creation or upgrades issued against "DB_NAME"
            connectionRequest.onupgradeneeded = (event) => {
                // terminate the Promise with a rejection
                reject(false);
            };
    });
};
