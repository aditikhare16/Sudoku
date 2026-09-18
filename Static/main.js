// Client-side rendering and interaction for the Flask-backed Sudoku
const boardContainer = document.getElementById('sudoku-board');
const difficultySelect = document.getElementById('difficulty');
const newGameButton = document.getElementById('new-game');
const checkButton = document.getElementById('check-solution');
const hintButton = document.getElementById('hint-button');
const themeToggleButton = document.getElementById('theme-toggle');
const message = document.getElementById('message');
const timerElement = document.getElementById('timer');
const leaderboardBody = document.getElementById('leaderboard-body');

let currentBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
let fixedBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
let solutionBoard = [];
let timerSeconds = 0;
let timerInterval = null;
let hintsUsed = 0;
let selectedCell = null;
let solved = false;
let hasSavedScore = false;

const DEFAULT_SCORES = [
  { rank: 1, name: 'Mark', time: 241, level: 'easy', hints: 1 },
  { rank: 2, name: 'Sara', time: 360, level: 'medium', hints: 2 },
  { rank: 3, name: 'Alex', time: 480, level: 'hard', hints: 3 },
  { rank: 4, name: 'Elena', time: 520, level: 'easy', hints: 0 },
  { rank: 5, name: 'David', time: 610, level: 'medium', hints: 1 },
  { rank: 6, name: 'Chloe', time: 695, level: 'hard', hints: 4 },
  { rank: 7, name: 'Lucas', time: 740, level: 'expert', hints: 2 },
  { rank: 8, name: 'Maya', time: 810, level: 'medium', hints: 3 },
  { rank: 9, name: 'James', time: 890, level: 'easy', hints: 1 },
  { rank: 10, name: 'Sofia', time: 950, level: 'hard', hints: 5 }
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function setMessage(text, type = 'info') {
  message.textContent = text;
  message.style.color = type === 'error'
    ? '#d33'
    : type === 'success'
      ? '#1d8f4d'
      : 'var(--text-color)';
}

function startTimer() {
  clearInterval(timerInterval);
  timerSeconds = 0;
  timerElement.textContent = `Time: ${formatTime(timerSeconds)}`;

  timerInterval = setInterval(() => {
    timerSeconds += 1;
    timerElement.textContent = `Time: ${formatTime(timerSeconds)}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function getConflicts(board) {
  const conflicts = new Set();
  const addConflict = (r, c) => conflicts.add(`${r}-${c}`);

  for (let r = 0; r < 9; r++) {
    const seen = new Map();
    for (let c = 0; c < 9; c++) {
      const value = board[r][c];
      if (value === 0) continue;
      if (seen.has(value)) {
        addConflict(r, seen.get(value));
        addConflict(r, c);
      } else {
        seen.set(value, c);
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    const seen = new Map();
    for (let r = 0; r < 9; r++) {
      const value = board[r][c];
      if (value === 0) continue;
      if (seen.has(value)) {
        addConflict(seen.get(value), c);
        addConflict(r, c);
      } else {
        seen.set(value, r);
      }
    }
  }

  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = new Map();
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          const value = board[r][c];
          if (value === 0) continue;
          if (seen.has(value)) {
            const prev = seen.get(value);
            addConflict(prev.row, prev.col);
            addConflict(r, c);
          } else {
            seen.set(value, { row: r, col: c });
          }
        }
      }
    }
  }

  return conflicts;
}

function loadLeaderboardFromStorage() {
  const saved = localStorage.getItem('sudoku_top10');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 10) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing leaderboard from localStorage', e);
    }
  }
  localStorage.setItem('sudoku_top10', JSON.stringify(DEFAULT_SCORES));
  return DEFAULT_SCORES;
}

function renderLeaderboard(entries) {
  leaderboardBody.innerHTML = '';
  if (!entries || entries.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5">No scores yet</td>';
    leaderboardBody.appendChild(row);
    return;
  }

  for (const entry of entries) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${entry.rank || '-'}</td>
      <td>${entry.name || 'Anonymous'}</td>
      <td>${formatTime(entry.time || 0)}</td>
      <td>${entry.level || '-'}</td>
      <td>${entry.hints || 0}</td>
    `;
    leaderboardBody.appendChild(tr);
  }
}

function fetchLeaderboard() {
  const entries = loadLeaderboardFromStorage();
  renderLeaderboard(entries);
}

function saveScore() {
  if (hasSavedScore) return;

  const playerName = window.prompt('Enter your name for the leaderboard:', 'Player');
  if (playerName === null) return;

  const name = (playerName || 'Player').trim() || 'Player';
  const newScore = {
    name,
    time: timerSeconds,
    level: difficultySelect.value,
    hints: hintsUsed
  };

  let scores = loadLeaderboardFromStorage();
  scores.push(newScore);
  scores.sort((a, b) => (a.time - b.time) || (a.hints - b.hints));

  scores = scores.slice(0, 10).map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));

  localStorage.setItem('sudoku_top10', JSON.stringify(scores));
  renderLeaderboard(scores);
  hasSavedScore = true;
}

function updateCellStyles(incorrectSet = new Set(), conflictSet = getConflicts(currentBoard)) {
  const inputs = boardContainer.querySelectorAll('input.cell');
  inputs.forEach(input => {
    const row = parseInt(input.dataset.row, 10);
    const col = parseInt(input.dataset.col, 10);
    const key = `${row}-${col}`;

    input.classList.remove('selected', 'incorrect', 'conflict');

    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      input.classList.add('selected');
    }
    if (incorrectSet.has(key)) {
      input.classList.add('incorrect');
    }
    if (conflictSet.has(key)) {
      input.classList.add('conflict');
    }
  });
}

function renderBoard(board, incorrectSet = new Set(), conflictSet = getConflicts(board)) {
  boardContainer.innerHTML = '';

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement('input');
      cell.type = 'text';
      cell.maxLength = 1;
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;

      const blockRow = Math.floor(row / 3);
      const blockCol = Math.floor(col / 3);
      if ((blockRow + blockCol) % 2 === 1) {
        cell.classList.add('block-alt');
      }

      const value = board[row][col];
      const isFixed = fixedBoard[row][col] === 1;

      if (isFixed) {
        cell.classList.add('fixed');
        cell.readOnly = true;
        cell.value = value === 0 ? '' : value;
      } else {
        cell.classList.add('editable');
        cell.value = value === 0 ? '' : value;
      }

      cell.addEventListener('focus', () => {
        selectedCell = { row, col };
        updateCellStyles(new Set(), getConflicts(currentBoard));
      });

      cell.addEventListener('input', (event) => {
        const rawValue = event.target.value.replace(/[^1-9]/g, '');
        event.target.value = rawValue;

        currentBoard[row][col] = rawValue === '' ? 0 : Number(rawValue);
        const conflicts = getConflicts(currentBoard);
        updateCellStyles(new Set(), conflicts);
      });

      boardContainer.appendChild(cell);
    }
  }

  updateCellStyles(incorrectSet, conflictSet);
}

function fetchNewGame() {
  const selectedDifficulty = difficultySelect.value;
  hasSavedScore = false;

  fetch(`/new?difficulty=${selectedDifficulty}`)
    .then(response => response.json())
    .then(data => {
      currentBoard = data.puzzle.map(row => [...row]);
      fixedBoard = data.puzzle.map(row => row.map(value => (value !== 0 ? 1 : 0)));
      solutionBoard = data.solution ? data.solution.map(row => [...row]) : [];
      solved = false;
      hintsUsed = 0;
      selectedCell = null;
      startTimer();
      renderBoard(currentBoard);
      setMessage(`New ${selectedDifficulty} puzzle ready.`, 'info');
    })
    .catch(error => {
      console.error('New game error:', error);
      setMessage('Could not load a new game.', 'error');
    });
}

function checkSolution() {
  fetch('/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board: currentBoard })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setMessage(data.error, 'error');
        return;
      }

      const incorrectSet = new Set(
        data.incorrect.map(([row, col]) => `${row}-${col}`)
      );
      const conflictSet = getConflicts(currentBoard);
      updateCellStyles(incorrectSet, conflictSet);

      if (data.solved) {
        solved = true;
        stopTimer();
        setMessage('Correct solution! Puzzle solved!', 'success');
        saveScore();
      } else if (data.incorrect.length === 0) {
        setMessage('No incorrect cells yet.', 'success');
      } else {
        setMessage(`${data.incorrect.length} incorrect cell(s).`, 'error');
      }
    })
    .catch(error => {
      console.error('Check error:', error);
      setMessage('Could not check solution.', 'error');
    });
}

function findEmptyCell() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (currentBoard[r][c] === 0) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

function useHint() {
  const target = selectedCell || findEmptyCell();
  if (!target) {
    setMessage('No empty cells remain.', 'info');
    return;
  }

  if (fixedBoard[target.row][target.col] === 1) {
    setMessage('Selected cell is already locked.', 'info');
    return;
  }

  fetch('/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      board: currentBoard,
      row: target.row,
      col: target.col
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setMessage(data.error, 'error');
        return;
      }

      const { row, col, value } = data;

      // Lock cell permanently upon hint fill
      currentBoard[row][col] = value;
      fixedBoard[row][col] = 1;

      hintsUsed = data.hints_used || (hintsUsed + 1);
      selectedCell = { row, col };
      renderBoard(currentBoard);

      setMessage(`Hint applied and cell locked: row ${row + 1}, col ${col + 1} = ${value}.`, 'info');
    })
    .catch(error => {
      console.error('Hint error:', error);
      setMessage('Could not apply hint.', 'error');
    });
}

newGameButton.addEventListener('click', fetchNewGame);
checkButton.addEventListener('click', checkSolution);
hintButton.addEventListener('click', useHint);

themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const darkModeEnabled = document.body.classList.contains('dark');
  themeToggleButton.textContent = darkModeEnabled ? 'Light Mode' : 'Dark/Light Mode';
});

difficultySelect.addEventListener('change', fetchNewGame);

fetchLeaderboard();
fetchNewGame();