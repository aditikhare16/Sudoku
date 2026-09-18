from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

DIFFICULTY_LEVELS = {
    'easy': 45,
    'medium': 35,
    'hard': 30,
    'expert': 25
}

def get_clues_for_difficulty(level):
    return DIFFICULTY_LEVELS.get(level.lower(), DIFFICULTY_LEVELS['medium'])

CURRENT = {
    'puzzle': None,
    'solution': None,
    'difficulty': 'medium',
    'hints_used': 0
}

# Fallback memory leaderboard (Client-side uses localStorage)
LEADERBOARD = [
    {'rank': 1, 'name': 'Mark', 'time': 241, 'level': 'easy', 'hints': 1},
    {'rank': 2, 'name': 'Sara', 'time': 360, 'level': 'medium', 'hints': 2},
    {'rank': 3, 'name': 'Alex', 'time': 480, 'level': 'hard', 'hints': 3}
]

def normalize_leaderboard(entries):
    sorted_entries = sorted(entries, key=lambda item: (item['time'], item['hints']))
    for index, entry in enumerate(sorted_entries[:10], start=1):
        entry['rank'] = index
    return sorted_entries[:10]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    difficulty = request.args.get('difficulty', 'medium')
    clues = get_clues_for_difficulty(difficulty)
    
    # Generates guaranteed 1-solution puzzle via sudoku_logic
    puzzle, solution = sudoku_logic.generate_puzzle(clues)

    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['difficulty'] = difficulty
    CURRENT['hints_used'] = 0

    return jsonify({
        'puzzle': puzzle,
        'solution': solution,
        'difficulty': difficulty,
        'clues': clues
    })

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json or {}
    board = data.get('board')
    solution = CURRENT.get('solution')

    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    incorrect = []
    for i in range(9):
        for j in range(9):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])

    solved = len(incorrect) == 0 and sudoku_logic.is_board_complete(board)

    return jsonify({
        'incorrect': incorrect,
        'solved': solved
    })

@app.route('/hint', methods=['POST'])
def hint():
    data = request.json or {}
    board = data.get('board')
    solution = CURRENT.get('solution')

    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    if not board:
        return jsonify({'error': 'Board missing'}), 400

    row = data.get('row')
    col = data.get('col')

    # If no specific cell was requested, pick the first empty one
    if row is None or col is None:
        for r in range(9):
            for c in range(9):
                if board[r][c] == 0:
                    row, col = r, c
                    break
            if row is not None and col is not None:
                break

    if row is None or col is None:
        return jsonify({'error': 'Board is already complete'}), 400

    value = solution[row][col]
    CURRENT['hints_used'] += 1

    return jsonify({
        'row': row,
        'col': col,
        'value': value,
        'hints_used': CURRENT['hints_used']
    })

@app.route('/leaderboard')
def leaderboard():
    return jsonify({'leaderboard': normalize_leaderboard(LEADERBOARD)})

@app.route('/save-score', methods=['POST'])
def save_score():
    global LEADERBOARD

    data = request.json or {}
    name = (data.get('name') or 'Anonymous').strip()[:20]
    if not name:
        name = 'Anonymous'

    score = {
        'name': name,
        'time': int(data.get('time', 0)),
        'level': data.get('level', 'medium'),
        'hints': int(data.get('hints', 0))
    }

    LEADERBOARD.append(score)
    LEADERBOARD = normalize_leaderboard(LEADERBOARD)

    return jsonify({'leaderboard': LEADERBOARD})

if __name__ == '__main__':
    app.run(debug=True)