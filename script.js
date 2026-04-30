
const board = document.getElementById("gameBoard");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const levelEl = document.getElementById("level");
const pairsLeftEl = document.getElementById("pairsLeft");
const messageEl = document.getElementById("message");
const resetBtn = document.getElementById("resetBtn");
const startScreen = document.getElementById("startScreen");
const setupForm = document.getElementById("setupForm");
const difficultySelect = document.getElementById("difficulty");
const cardSetSelect = document.getElementById("cardSet");

const cardSets = {
    fruits: [
        "🍉", "🍎", "🍒", "🍋", "🍇", "🍍", "🥝", "🍓",
        "🥕", "🌽", "🍄", "🥑", "🍕", "🍔", "🍩", "🍪"
    ],
    sports: [
        "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱",
        "🏓", "🏸", "🥅", "🥊", "🏒", "🏏", "🥋", "⛳"
    ],
    mixed: [
        "🍉", "🍎", "🍒", "🍋", "🍇", "🍍", "🥝", "🍓",
        "⚽", "🏀", "🎯", "🎮", "🎧", "🎲", "🚗", "🚀"
    ]
};

const difficultyLevels = {
    easy: { pairs: 6, columns: 4 },
    medium: { pairs: 8, columns: 4 },
    hard: { pairs: 10, columns: 5 },
    expert: { pairs: 12, columns: 6 }
};

let currentLevel = 0;
let moves = 0;
let matches = 0;
let firstPick = null;
let secondPick = null;
let lockBoard = false;
let timerId = null;
let elapsedSeconds = 0;
let timerStarted = false;
let selectedDifficulty = 'easy';
let selectedCardSet = 'fruits';
let currentConfig = difficultyLevels[selectedDifficulty];
let currentSymbols = cardSets[selectedCardSet];

function showGameUI() {
    document.querySelector('.topbar').style.display = '';
    document.querySelector('.status-panel').style.display = '';
    document.getElementById('message').style.display = '';
    document.getElementById('gameBoard').parentElement.style.display = '';
}

function hideGameUI() {
    document.querySelector('.topbar').style.display = 'none';
    document.querySelector('.status-panel').style.display = 'none';
    document.getElementById('message').style.display = 'none';
    document.getElementById('gameBoard').parentElement.style.display = 'none';
}

function startGameFromSetup(e) {
    if (e) e.preventDefault();
    selectedDifficulty = difficultySelect.value;
    selectedCardSet = cardSetSelect.value;
    currentConfig = difficultyLevels[selectedDifficulty];
    currentSymbols = cardSets[selectedCardSet];
    startScreen.style.display = 'none';
    showGameUI();
    startLevel(true);
}

setupForm.addEventListener('submit', startGameFromSetup);

// Hide game UI and show start screen on load
hideGameUI();
startScreen.style.display = 'flex';

function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
}

function startTimer() {
    if (timerStarted) {
        return;
    }
    timerStarted = true;
    timerId = setInterval(() => {
        elapsedSeconds += 1;
        timerEl.textContent = formatTime(elapsedSeconds);
    }, 1000);
}

function stopTimer() {
    if (timerId) {
        clearInterval(timerId);
    }
    timerId = null;
}

function setMessage(text, warning = false) {
    messageEl.textContent = text;
    messageEl.classList.toggle("warn", warning);
}

function getLevelConfig() {
    // Only one level per game in this mode, but keep for future multi-level
    return currentConfig;
}

function updateStats() {
    const config = getLevelConfig();
    movesEl.textContent = String(moves);
    levelEl.textContent = '1';
    pairsLeftEl.textContent = String(config.pairs - matches);
}

function createCard(symbol, id) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.dataset.symbol = symbol;
    card.dataset.id = String(id);
    card.setAttribute("aria-label", "Hidden card");

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-face card-back">?</div>
            <div class="card-face card-front">${symbol}</div>
        </div>
    `;

    card.addEventListener("click", () => handleCardClick(card));
    return card;
}

function resetTurn() {
    firstPick = null;
    secondPick = null;
    lockBoard = false;
}

function handleCardClick(card) {
    if (lockBoard || card.classList.contains("matched") || card === firstPick) {
        return;
    }

    if (!timerStarted) {
        startTimer();
    }

    card.classList.add("flipped");

    if (!firstPick) {
        firstPick = card;
        return;
    }

    secondPick = card;
    lockBoard = true;
    moves += 1;
    movesEl.textContent = String(moves);

    const isMatch = firstPick.dataset.symbol === secondPick.dataset.symbol;

    if (isMatch) {
        firstPick.classList.add("matched");
        secondPick.classList.add("matched");
        matches += 1;
        updateStats();
        resetTurn();

        const config = getLevelConfig();
        if (matches === config.pairs) {
            stopTimer();
            const finalTime = formatTime(elapsedSeconds);
            setMessage(`You matched all pairs in ${finalTime} with ${moves} moves! Hit New Game to play again.`);
        } else {
            setMessage("Nice match! Keep going.");
        }
        return;
    }

    setMessage("No match. Try again.", true);
    setTimeout(() => {
        firstPick.classList.remove("flipped");
        secondPick.classList.remove("flipped");
        resetTurn();
    }, 850);
}

resetBtn.addEventListener("click", () => {
    hideGameUI();
    startScreen.style.display = 'flex';
});
