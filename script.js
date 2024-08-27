document.addEventListener('DOMContentLoaded', function() {
    populateKeyboard();
    setWord();
    document.addEventListener('keydown', handleKeyPress);
});

const board = document.getElementById('board');

function populateKeyboard() {
    const qwertyLayout = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    const keyboard = document.getElementById('keyboard');
    qwertyLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
      
        row.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.classList.add('key');
            keyDiv.textContent = key;
            keyDiv.id = key;
            keyDiv.setAttribute('data-key', key);
            rowDiv.appendChild(keyDiv);
        });
      
        keyboard.appendChild(rowDiv);
    });

    // Add Enter and Backspace keys
    const bottomRow = document.querySelector('.keyboard-row:last-child');
    const enterKeyDiv = document.createElement('div');
    enterKeyDiv.classList.add('key', 'key-enter');
    enterKeyDiv.innerHTML = '<p class="go">ENTER</p>';
    enterKeyDiv.setAttribute('data-key', 'Enter');
    bottomRow.insertBefore(enterKeyDiv, bottomRow.firstChild);

    const backspaceKeyDiv = document.createElement('div');
    backspaceKeyDiv.classList.add('key', 'key-backspace');
    backspaceKeyDiv.innerHTML = '<i class="fa-regular fa-delete-left"></i>';
    backspaceKeyDiv.setAttribute('data-key', 'Backspace');
    bottomRow.appendChild(backspaceKeyDiv);

    // Attach event listeners only once
    document.querySelectorAll('.key').forEach(key => key.addEventListener('click', handleButtonClick));
}

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
    if (!key) {
        return;
    }
    if (key === 'Enter') {
        checkGuess();
    } else if (key === 'Delete' || key === 'Backspace') {
        deleteLetter();
    } else {
        addLetter(key.toUpperCase());
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
                box.classList.add('true');
                const matchingKey = document.getElementById(`${letter}`);
                matchingKey.classList.add('key-true');
                currentLetterCount[letter] = (currentLetterCount[letter] || 0) + 1;
            }
        }

        for (let i = 0; i < 5; i++) {
            const box = document.getElementById(`g${currentRow}-l${i+1}`);
            const letter = currentGuess[i];

            if (letter !== targetWord[i]) {
                if (targetWord.includes(letter) && (currentLetterCount[letter] || 0) < targetLetterCount[letter]) {
                    box.classList.add('partial');
                    const matchingKey = document.getElementById(`${letter}`);
                    matchingKey.classList.add('key-partial');
                    currentLetterCount[letter] = (currentLetterCount[letter] || 0) + 1;
                } else {
                    box.classList.add('false');
                    const matchingKey = document.getElementById(`${letter}`);
                    matchingKey.classList.add('key-false');
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
    const resultContainer = document.getElementById('result');
    const keyboard = document.getElementById('keyboard');
    resultContainer.style.display = 'flex';
    keyboard.style.display = 'none';
    if (isWin) {
        let tries = '';
        if (currentRow === 1) {
            tries = 'try';
        } else {
            tries = 'tries';
        }
        resultContainer.innerHTML = `
            <h3 class="result-title title-win">You won!</h3>
            <p class="result-text">You guessed the correct word in ${currentRow} ${tries} 🎉</p>
            <button class="play-again-btn" id="play-again-btn">Play again</button>
        `;
    } else {
        resultContainer.innerHTML = `
            <h3 class="result-title title-lose">Game over!</h3>
            <p class="result-text">The correct word was ${targetWord.toUpperCase()}.</p>
            <button class="play-again-btn" id="play-again-btn">Play again</button>
        `;
    }
    document.getElementById('play-again-btn').addEventListener('click', resetGame);
}

function resetGame() {
    currentGuess = '';
    currentRow = 1;
    gameEnded = false;
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        box.textContent = '';
    });
    const keyboard = document.getElementById('keyboard');
    keyboard.style.display = 'flex';
    boxes.forEach(box => {
        box.classList.remove('true');
        box.classList.remove('false');
        box.classList.remove('partial');
    });
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('key-true');
        key.classList.remove('key-partial');
        key.classList.remove('key-false');
    });
    document.getElementById('result').style.display = 'none';
    setWord();
}

function setWord() {
    fetch('https://random-word-api.herokuapp.com/word?length=5')
        .then(response => response.json())
        .then(data => {
            targetWord = data[0].toUpperCase();
            console.log(`The correct word is: ${targetWord}`);
        })
        .catch(error => console.error('Error fetching word:', error));
}
