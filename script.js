document.addEventListener('DOMContentLoaded', function() {
    setWord();
});

function setWord() {
    fetch('https://random-word-api.herokuapp.com/word?length=5')
        .then(response => response.json())
        .then(data => {
            targetWord = data[0].toUpperCase();
            console.log(`The word to guess is: ${targetWord}`);
        })
        .catch(error => console.error('Error fetching word:', error));
}

document.addEventListener('keydown', handleKeyPress);
document.querySelectorAll('.key').forEach(key => key.addEventListener('click', handleButtonClick));

function handleKeyPress(event) {
    if (event.key.match(/^[a-zA-Z]$/)) {
        addLetter(event.key.toUpperCase());
    }
    if (event.key === "Enter") {
        checkGuess();
    }
    if (event.key === "Backspace") {
        deleteLetter();
    }
}

function handleButtonClick(event) {
    const key = event.target.getAttribute('data-key');
    if (key) {
        if (key === 'enter') {
            checkGuess();
        } else if (key === 'delete') {
            deleteLetter();
        } else {
            addLetter(key.toUpperCase());
        }
    }
}

let currentGuess = '';
let currentRow = 1;
let gameEnded = false;

function addLetter(letter) {
    if (currentGuess.length < 5 && !gameEnded) {
        currentGuess += letter;
        updateBoard();
    }
}

function deleteLetter() {
    if (!gameEnded && currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateBoard();
    }
}

function updateBoard() {
    for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`g${currentRow}-l${i+1}`);
        box.textContent = currentGuess[i] ? currentGuess[i] : '';
    }
}

function checkGuess() {
    if (currentGuess.length === 5) {
        const targetLetterCount = {};
        for (let i = 0; i < 5; i++) {
            targetLetterCount[targetWord[i]] = (targetLetterCount[targetWord[i]] || 0) + 1;
        }
        
        const currentLetterCount = {};

        for (let i = 0; i < 5; i++) {
            const box = document.getElementById(`g${currentRow}-l${i+1}`);
            const letter = currentGuess[i];

            if (letter === targetWord[i]) {
                box.style.backgroundColor = '#00a170';
                box.style.color = 'white';
                box.style.fontWeight = '500';
                box.style.borderColor = '#00a170';
                currentLetterCount[letter] = (currentLetterCount[letter] || 0) + 1;
            }
        }

        for (let i = 0; i < 5; i++) {
            const box = document.getElementById(`g${currentRow}-l${i+1}`);
            const letter = currentGuess[i];

            if (letter !== targetWord[i]) {
                if (targetWord.includes(letter) && (currentLetterCount[letter] || 0) < targetLetterCount[letter]) {
                    box.style.backgroundColor = '#ffb100';
                    box.style.color = 'white';
                    box.style.fontWeight = '500';
                    box.style.borderColor = '#ffb100';
                    currentLetterCount[letter] = (currentLetterCount[letter] || 0) + 1;
                } else {
                    box.style.backgroundColor = '#ccc';
                    box.style.color = 'white';
                    box.style.fontWeight = '500';
                    box.style.borderColor = '#ccc';
                }
            }
        }

        if (currentGuess === targetWord) {
            gameOver(true);
        } else if (currentRow === 6) {
            gameOver(false);
        } else {
            currentRow++;
            currentGuess = '';
        }
    }
}

function gameOver(isWin) {
    gameEnded = true;
    const resultContainer = document.querySelector('.result');
    const keyboardContainer = document.querySelector('.keyboard-container');
    resultContainer.style.display = 'flex';
    keyboardContainer.style.display = 'none';
    if (isWin) {
        let tries = '';
        if (currentRow === 1) {
            tries = 'try';
        } else {
            tries = 'tries';
        } 
        resultContainer.innerHTML = `
            <h2 class="result-title win">You won!</h2>
            <p class="result-text">You guessed the correct word in ${currentRow} ${tries} 🥳</p>
            <button class="play-btn" id="play-again">Play again</button>
        `;
    } else {
        resultContainer.innerHTML = `
            <h2 class="result-title">Game over!</h2>
            <p class="result-text">The correct word was ${targetWord}</p>
            <button class="play-btn" id="play-again">Play again</button>
        `;
    }
    document.getElementById('play-again').addEventListener('click', resetGame);
}

function resetGame() {
    currentGuess = '';
    currentRow = 1;
    gameEnded = false;
    const boxes = document.querySelectorAll('.box');
    const keyboardContainer = document.querySelector('.keyboard-container');
    keyboardContainer.style.display = 'flex';
    boxes.forEach(box => {
        box.textContent = '';
        box.style.backgroundColor = '#f1f1f1';
        box.style.color = 'black';
        box.style.fontWeight = 'normal';
        box.style.borderColor = '#ccc';
    });
    document.querySelector('.result').style.display = 'none';
    setWord();
}
