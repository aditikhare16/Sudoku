# Flask Sudoku Web Application

A full-stack, responsive Sudoku web application built with Python (Flask) and vanilla JavaScript. Features difficulty controls, unique puzzle generation, real-time input conflict highlighting, alternating 3×3 block shading, theme toggling, and Local Storage persistent leaderboards[cite: 1, 6, 8, 9].

---

## Key Features

- **Guaranteed Unique Solution**: Backend backtracking engine ensures every generated puzzle has exactly 1 valid solution.
- **Dynamic Difficulty**: Supports Easy, Medium, Hard, and Expert levels[cite: 1, 6].
- **Real-Time Validation**: Instant visual feedback on row, column, and 3×3 box number conflicts[cite: 8].
- **Top 10 Leaderboard**: Automatically persists high scores locally across browser sessions using `window.localStorage`[cite: 1].
- **Alternating 3×3 Shading**: Custom CSS grid styling visually distinguishes alternating $3 \times 3$ sub-grids[cite: 1, 9].
- **Dark & Light Mode**: Seamless theme switching driven by root CSS variables[cite: 8, 9].

---

## Project Structure

```text
.
├── app.py                   # Flask API backend & route handlers
├── sudoku_logic.py          # Core Sudoku puzzle generator & uniqueness solver
├── test_sudoku.py           # Automated unit test suite
├── instructions.md          # Architecture guidelines & Copilot system instructions
├── README.md                # Project documentation
├── static/
│   ├── styles.css           # Global layout, themes, & 3x3 block styling
│   └── main.js              # Frontend UI interactions & Local Storage persistence
├── templates/
│   └── index.html           # Main HTML structure
└── Screenshots/             # Verification & Copilot execution screenshots