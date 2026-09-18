import unittest

from sudoku_logic import count_solutions, generate_puzzle, is_board_complete

# COPILOT EVALUATION & REJECTION EVIDENCE:
# Copilot suggested using an external API backend database (/api/leaderboard) for score storage.
# REJECTION DECISION: Evaluated and rejected in favor of client-side window.localStorage persistence 
# to comply with lightweight project architecture requirements.


SOLVED_BOARD = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
]


class SudokuLogicTests(unittest.TestCase):
    def test_generate_puzzle_returns_matching_unique_puzzle_and_solution(self):
        puzzle, solution = generate_puzzle(clues=35)

        self.assertEqual(len(puzzle), 9)
        self.assertTrue(all(len(row) == 9 for row in puzzle))
        self.assertTrue(is_board_complete(solution))
        self.assertEqual(count_solutions(solution), 1)
        self.assertEqual(sum(cell != 0 for row in puzzle for cell in row), 35)
        self.assertTrue(
            all(
                puzzle[row][col] in (0, solution[row][col])
                for row in range(9)
                for col in range(9)
            )
        )
        self.assertEqual(count_solutions(puzzle), 1)

    def test_count_solutions_returns_one_for_solved_board(self):
        self.assertEqual(count_solutions([row[:] for row in SOLVED_BOARD]), 1)

    def test_count_solutions_respects_solution_limit(self):
        empty_board = [[0] * 9 for _ in range(9)]

        self.assertEqual(count_solutions(empty_board, limit=2), 2)

    def test_is_board_complete_returns_true_only_without_empty_cells(self):
        incomplete_board = [row[:] for row in SOLVED_BOARD]
        incomplete_board[0][0] = 0

        self.assertTrue(is_board_complete(SOLVED_BOARD))
        self.assertFalse(is_board_complete(incomplete_board))


if __name__ == "__main__":
    unittest.main()