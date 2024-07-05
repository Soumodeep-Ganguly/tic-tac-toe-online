class Game {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.firstPlayer = 'X';
    }

    makeMove(index) {
        if(!this.board[index] && !this.winner) {
            this.board[index] = this.currentPlayer;
            this.winner = this.calculateWinner();
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
    }

    calculateWinner() {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for(let line of lines) {
            const [a, b, c] = line;
            if(this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a]
            }
        }

        return null;
    }

    isBoardFull() {
        return this.board.every(cell => cell);
    }

    getState() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            winner: this.winner
        };
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = this.firstPlayer; // Reset to the starting player for next game
        this.winner = null;
        this.firstPlayer = this.firstPlayer === 'X' ? 'O' : 'X'; // Toggle starting player for next game
    }
}

module.exports = Game;