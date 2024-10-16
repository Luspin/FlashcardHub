import { firebaseUser } from './userPreferences.js';
import { DB_NAME, activeStore, currentCard, calculateCorrectGuessRatio, displayRandomFlashcard } from "./deckManagement.js";
import { uploadUserScores } from './Firebase/firestore.js';

export async function evaluateAnswer(userResponse) {
    await assessAnswer(userResponse)
        .then(() => { recordAnswer() });
};

async function assessAnswer(userResponse) {
    if (userResponse.toLowerCase() == currentCard.answer) {
        var audio = new Audio('./media/audio/correctAnswer.mp3');
        audio.play();
        currentCard.correctGuesses++;
        await animateFlashcard(true);
    }
    else {
        var audio = new Audio('./media/audio/incorrectAnswer.mp3');
        audio.play();
        currentCard.incorrectGuesses++;
        await animateFlashcard(false);
    }
};

async function recordAnswer() {
    console.log("Recording answer for \"currentCard\":", currentCard); // log currentCard

    // establish a connection against "DB_NAME"
    const openRequest = indexedDB.open(DB_NAME);

    // handle successful connections against "DB_NAME"
    openRequest.onsuccess = (event) => {
        const databaseConnection = event.target.result;
        console.log("Connected to DB:", DB_NAME); // log DB connection success
        // create a read-write transaction for the "activeStore" under "DB_NAME"
        const readWriteTransaction = databaseConnection.transaction(activeStore, 'readwrite');
        const objectStore = readWriteTransaction.objectStore(activeStore);
        const updateRequest = objectStore.put(currentCard);

        updateRequest.onsuccess = () => {
            console.log(`Updated local record for '${activeStore}' > '${currentCard.question}'`);
            // close the database connection against "DB_NAME"
            databaseConnection.close();
        };

        updateRequest.onerror = () => {
            console.error(`Couldn't updated local record for '${activeStore}' > '${currentCard.question}'`);
            databaseConnection.close();
        };
    };

    openRequest.onerror = () => {
        console.error(`Couldn't connect to '${DB_NAME}'.`);
    };

    if (firebaseUser) {
        await uploadUserScores(
            firebaseUser,
            {
                "question"         : currentCard.question,
                "correctGuesses"   : (currentCard.correctGuesses || 0),
                "incorrectGuesses" : (currentCard.incorrectGuesses || 0)
            }
        );
    };
};

const animateFlashcard = async (correctGuess = false) => {
    // Apply flip animation
    cardContainer.style.transition = 'transform 0.8s';
    cardContainer.style.transform = 'rotateY(180deg)';

    cardFace.textContent = "";

    setTimeout(() => {
        // Set the correct or incorrect style based on the guess
        if (correctGuess) {
            correctGuesses.textContent = `✔️ ${currentCard.correctGuesses}`;
            cardContainer.style.backgroundColor = '#4caf50';
        } else {
            incorrectGuesses.textContent = `❌ ${currentCard.incorrectGuesses}`;
            cardContainer.style.backgroundColor = '#ff6347';
        }

        // Reset the flip after showing the result
        cardContainer.style.transform = 'rotateY(0deg)';
// temporarily show the correct answer from "currentCard"
    cardFace.textContent = `${currentCard.answer}`;
        percentageRatio.textContent = `🎯 ${calculateCorrectGuessRatio(currentCard.correctGuesses, currentCard.incorrectGuesses)}%`;
    }, 800); // Delay to match the flip animation

    // Fade-out and reset the card after 2 seconds
    setTimeout(async () => {
        // Add fade-out animation before resetting
        cardContainer.style.transition = 'opacity 0.5s';
        cardContainer.style.opacity = 0;

        setTimeout(async () => {
            // Reset card and make it fade back in
            cardContainer.style.backgroundColor = null;
            await displayRandomFlashcard(activeStore);

            // Fade-in effect
            cardContainer.style.opacity = 1;
        }, 500); // Duration of fade-out
    }, 2000);
};
