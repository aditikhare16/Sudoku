import random


def is_valid(board, row, col, num):
    """Check if placing num at board[row][col] is valid."""
    for i in range(9):
        if board[row][i] == num or board[i][col] == num:
            return False

    start_row, start_col = 3 * (row // 3), 3 * (col // 3)
    for r in range(start_row, start_row + 3):
        for c in range(start_col, start_col + 3):
            if board[r][c] == num:
                return False
    return True


def count_solutions(board, limit=2):
    """
    Counts solutions using backtracking up to the specified limit.
    Used during puzzle generation to verify uniqueness (limit=2).
    """
    count = 0

    def solve():
        nonlocal count
        if count >= limit:
            return

        for row in range(9):
            for col in range(9):
                if board[row][col] == 0:
                    for num in range(1, 10):
                        if is_valid(board, row, col, num):
                            board[row][col] = num
                            solve()
                            board[row][col] = 0
                    return
        count += 1

    solve()
    return count


def generate_full_board():
    """Generates a complete, valid 9x9 Sudoku board."""
    board = [[0] * 9 for _ in range(9)]

    def fill(r=0, c=0):
        if r == 9:
            return True
        next_r, next_c = (r, c + 1) if c < 8 else (r + 1, 0)

        nums = list(range(1, 10))
        random.shuffle(nums)
        for num in nums:
            if is_valid(board, r, c, num):
                board[r][c] = num
                if fill(next_r, next_c):
                    return True
                board[r][c] = 0
        return False

    fill()
    return board


def generate_puzzle(clues=35):
    """
    Generates a puzzle by removing numbers from a full board one by one,
    verifying after each removal that the board still has exactly ONE unique solution.
    """
    solution = generate_full_board()
    puzzle = [row[:] for row in solution]

    cells = [(r, c) for r in range(9) for c in range(9)]
    random.shuffle(cells)

    removed = 0
    target_removals = 81 - clues

    for r, c in cells:
        if removed >= target_removals:
            break

        temp = puzzle[r][c]
        puzzle[r][c] = 0

        # Uniqueness check: count_solutions must equal 1
        board_copy = [row[:] for row in puzzle]
        if count_solutions(board_copy, limit=2) != 1:
            puzzle[r][c] = temp  # Restore value if multiple solutions exist
        else:
            removed += 1

    return puzzle, solution


def is_board_complete(board):
    """Check if the board is completely filled (no zeros)."""
    return all(cell != 0 for row in board for cell in row)