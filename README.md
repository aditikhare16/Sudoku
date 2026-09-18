# 🧩 Flask-Powered Sudoku Web Application

An interactive, responsive, full-stack Sudoku web application built with Flask and vanilla JavaScript. This project features guaranteed unique-solution puzzle generation, real-time client-side conflict checking, cell-locking hints, a persistent leaderboard, and a clean responsive interface supporting both Light and Dark themes.

---

## 📸 Overview & Key Features

* **Guaranteed Unique Puzzles:** Every puzzle is programmatically generated and verified using a backtracking solver engine to guarantee exactly **one** valid solution.
* **4 Difficulty Levels:** Select between Easy (45 clues), Medium (35 clues), Hard (30 clues), and Expert (25 clues).
* **Smart Cell-Locking Hints:** Applying a hint auto-fills a target cell and permanently locks it as read-only.
* **Real-Time Conflict Detection:** Automatically highlights row, column, and 3×3 subgrid conflicts as you type.
* **Persistent Top 10 Leaderboard:** Automatically tracks fastest completion times and hint counts using browser `localStorage`.
* **Mobile-Responsive UI:** Responsive 9×9 grid and table scrolling optimized for screen sizes down to 375px (iPhone SE).
* **Light/Dark Theme Toggle:** Seamless theme switcher with full CSS custom property adaptation.

---

## 🛠️ Tech Stack & Architecture

* **Backend:** Python 3, Flask
* **Frontend:** HTML5, CSS3 (CSS Variables, Grid, Flexbox), Vanilla JavaScript (ES6+)
* **Testing:** `unittest` / `pytest`
* **Persistence:** Client-side `window.localStorage` (Leaderboard) & Flask In-Memory State

---

## 📁 Project Structure

```text
sudoku-app/
│
├── app.py                  # Flask web server and API endpoints
├── sudoku_logic.py         # Sudoku algorithm core (generation, validation, uniqueness solver)
├── test_sudoku.py          # Unit test suite for Sudoku board logic
├── requirements.txt        # Python dependency manifest
├── README.md               # Project documentation
│
├── static/
│   ├── main.js             # Client-side UI rendering, timer, board interactions, and API calls
│   └── styles.css          # Modern, responsive styling with dark/light mode CSS variables
│
└── templates/
    └── index.html          # Main HTML5 application shell & leaderboard interface

```

---

## 📄 File Details & Purpose

### 1. `app.py`

The entry point for the backend Flask web server.

* **`GET /`**: Serves the primary web interface (`index.html`).
* **`GET /new`**: Receives difficulty query parameters, generates a unique puzzle using `sudoku_logic.py`, and returns puzzle grid data to the frontend.
* **`POST /check`**: Compares the user’s active board against the solution grid and returns incorrect cell positions or win status.
* **`POST /hint`**: Finds an empty cell (or targets a user-selected cell) and supplies the correct value while incrementing the session hint counter.
* **`GET /leaderboard` & `POST /save-score**`: In-memory fallback routes for leaderboard interaction.

### 2. `sudoku_logic.py`

The core algorithmic module handling board operations without external database dependencies:

* **`is_valid(board, row, col, num)`**: Validates if placing a number breaks standard Sudoku row, column, or 3×3 box rules.
* **`count_solutions(board, limit=2)`**: Uses depth-first backtracking to count valid solutions up to a threshold (`limit=2`). This powers the uniqueness verification engine.
* **`generate_full_board()`**: Randomly generates a complete, valid 81-cell Sudoku solution board.
* **`generate_puzzle(clues=35)`**: Takes a full board and iteratively removes numbers one by one. After each removal, `count_solutions` verifies that the puzzle retains **exactly 1 unique solution**. If removing a number creates multiple solutions, the number is restored.
* **`is_board_complete(board)`**: Checks whether all empty cells (`0`) have been filled.

### 3. `test_sudoku.py`

Automated unit testing suite validating backend algorithmic integrity.

* Tests solution verification accuracy (`count_solutions`).
* Tests clue density and matrix output dimensions.
* Tests empty-cell detection (`is_board_complete`).
* Documents Copilot design evaluation and rejection decisions in header comments.

### 4. `static/main.js`

Manages all frontend application state, DOM rendering, timer loops, and API communication:

* **Grid Rendering & Alternating 3×3 Blocks:** Dynamically builds input elements and adds alternating subgrid styling (`.block-alt`).
* **Instant Conflict Handling:** Implements `getConflicts()` locally to highlight duplicates in yellow in real time.
* **Immediate Hint Cell Locking:** When `/hint` responds, `fixedBoard[row][col]` updates immediately to `1`, setting `cell.readOnly = true` to lock the cell against user modification.
* **Leaderboard Persistence:** Handles reading/writing the top 10 fastest completion times to `localStorage` key `sudoku_top10`.

### 5. `static/styles.css`

Contains full responsive layout rules and color variables:

* Includes CSS variables for dynamic Dark Mode support.
* Uses modern CSS Grid for the 9×9 Sudoku layout.
* Includes `.table-responsive` with horizontal overflow handling and specific `@media (max-width: 380px)` font/padding rules to ensure mobile readability.

### 6. `templates/index.html`

Application shell housing control panels, state messages, board container, timer, and leaderboard table.

---

## ⚙️ Backend Details & Implementation Deep Dive

### Unique Solution Engine

A common issue in simple Sudoku generators is creating boards with multiple valid completion paths. This application enforces single-solution uniqueness through constraint backtracking:

1. A complete $9 \times 9$ matrix is generated using randomized backtracking.
2. Cells are selected at random and set to `0` (empty).
3. A shallow copy of the modified board is tested via `count_solutions(board, limit=2)`.
4. If `count_solutions` finds 2 solutions, the backtrack algorithm aborts early, restores the original number, and moves to the next cell.
5. This process continues until the requested target clue count (e.g., 35 for Medium) is reached.

---

## 🚀 Getting Started & Local Setup

### Prerequisites

* Python 3.8 or higher installed on your system.

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/sudoku-app.git](https://github.com/your-username/sudoku-app.git)
cd sudoku-app

```

### 2. Create and Activate a Virtual Environment

```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate

```

### 3. Install Dependencies

```bash
pip install -r requirements.txt

```

### 4. Run the Application

```bash
python app.py

```

Open your web browser and navigate to `http://127.0.0.1:5000`.

---

## 🧪 Running Unit Tests

To run the automated backend tests using standard `unittest`:

```bash
python -m unittest test_sudoku.py

```

Or using `pytest`:

```bash
pytest

```

---

## 📜 License

This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE&utm_source=gemini).

```

```
