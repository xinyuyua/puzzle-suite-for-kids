from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# CONFIGURATION FOR MULTIPLE GAMES
GAMES = {
    "8x8_classic": {
        "size": 8,
        "clicks": 6,
        "blocks": [(1,4), (1,5), (2,2), (3,3), (2,3), (2,4), (2,5), (3,4)]
    },
    "6x6_mini": {
        "size": 6,
        "clicks": 3, # e.g., one 1x1 and one 1x2
        "blocks": [(2,2), (2,3), (3,3), (1,4), (2,4)] # Must sum to 36 total cells
    }
}

def can_place(board, r, c, w, h, size):
    if r + h > size or c + w > size: return False
    return all(board[i][j] == 0 for i in range(r, r + h) for j in range(c, c + w))

def place(board, r, c, w, h, val):
    for i in range(r, r + h):
        for j in range(c, c + w):
            board[i][j] = val

def solve(board, blocks_left, full_list, size):
    if not blocks_left: return True
    for r in range(size):
        for c in range(size):
            if board[r][c] == 0:
                for i, (bw, bh) in enumerate(blocks_left):
                    original_id = full_list.index((bw, bh)) + 2
                    for w, h in list(set([(bw, bh), (bh, bw)])):
                        if can_place(board, r, c, w, h, size):
                            place(board, r, c, w, h, original_id)
                            if solve(board, blocks_left[:i] + blocks_left[i+1:], full_list, size):
                                return True
                            place(board, r, c, w, h, 0)
                return False
    return True

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve_puzzle():
    data = request.json
    game_id = data.get('game_id')
    selected_cells = data.get('cells')
    
    config = GAMES.get(game_id)
    if not config: return jsonify(success=False, message="Game not found")
    
    if len(selected_cells) != config['clicks']:
        return jsonify(success=False, message=f"Select {config['clicks']} cells.")

    size = config['size']
    board = [[0 for _ in range(size)] for _ in range(size)]
    for r, c in selected_cells:
        board[r][c] = 1
    
    if solve(board, config['blocks'], config['blocks'], size):
        return jsonify(success=True, board=board)
    return jsonify(success=False, message="No solution found.")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)