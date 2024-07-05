require('dotenv').config();
const express = require('express');
const colors = require('colors')
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // The URL of your client application
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

const games = {};

io.on('connection', (socket) => {
    console.log("New client connected");

    socket.on('createGame', () => {
        const gameId = uuidv4();
        const game = new Game();
        games[gameId] = { game, players: [{ id: socket.id, role: 'X' }] };
        socket.join(gameId);
        io.to(socket.id).emit('gameCreated', { gameId, game: game.getState(), role: 'X' });
    });

    socket.on('joinGame', (gameId) => {
        const gameData = games[gameId];
        if (gameData && gameData.players.length < 2) {
            const role = gameData.players[0].role === 'X' ? 'O' : 'X';
            gameData.players.push({ id: socket.id, role });
            socket.join(gameId);

            // Emit to the current socket (joining player)
            io.to(socket.id).emit('gameJoined', { game: gameData.game.getState(), role });

            // Emit to all in the room except the joining player
            socket.to(gameId).emit('opponentJoined', { role });
        } else {
            socket.emit('error', 'Game not found or already full');
        }
    });

    socket.on('makeMove', ({ gameId, index, role }) => {
        const gameData = games[gameId];
        if (gameData && gameData.players.length === 2 && gameData.game.currentPlayer === role) {
            gameData.game.makeMove(index);
            io.to(gameId).emit('moveMade', gameData.game.getState());
            if (gameData.game.winner || gameData.game.isBoardFull()) {
                io.to(gameId).emit('gameOver', gameData.game.getState());
            }
        }
    });

    socket.on('resetGame', (gameId) => {
        const gameData = games[gameId];
        if (gameData && gameData.players.length === 2) {
            gameData.game.resetGame();
            io.to(gameId).emit('newGame', gameData.game.getState());
        }
    });

    socket.on('disconnect', () => {
        console.log("Client disconnect");
        for (const [gameId, gameData] of Object.entries(games)) {
            gameData.players = gameData.players.filter(player => player !== socket.id);
            if (gameData.players.length === 0) {
                delete games[gameId];
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port`, colors.blue(`${PORT}`));
});