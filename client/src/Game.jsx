import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Game.css';

const socket = io("http://localhost:8080");

const Game = () => {
    const [game, setGame] = useState(null);
    const [gameId, setGameId] = useState('');
    const [message, setMessage] = useState('');
    const [playerRole, setPlayerRole] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [allowReset, setAllowReset] = useState(false);

    useEffect(() => {
        socket.on('gameCreated', ({ gameId, game, role }) => {
            setGameId(gameId);
            setGame(game);
            setPlayerRole(role);
            setMessage(`Game created! Share this Game ID with your friend: ${gameId}`);
        });
    
        socket.on('gameJoined', ({ game, role }) => {
            setGame(game);
            setPlayerRole(role);
            setHasJoined(true);
            setMessage(`Joined game as Player ${role}`);
        });

        socket.on('opponentJoined', ({ role }) => {
            setHasJoined(true);
            setMessage(`A player has joined.`);
        });
    
        socket.on('moveMade', (game) => {
            setGame(game);
        });
    
        socket.on('gameOver', (game) => {
            setGame(game);
            setMessage(game.winner ? `Player ${game.winner} wins!` : 'Draw!');
            setAllowReset(true)
        });

        socket.on('newGame', (game) => {
            setGame(game);
            setMessage(`New game started!`);
            setAllowReset(false)
        });

        return () => {
            socket.off('gameCreated');
            socket.off('gameJoined');
            socket.off('opponentJoined');
            socket.off('moveMade');
            socket.off('gameOver');
            socket.off('newGame');
        }
    }, [])

    const createGame = () => {
        socket.emit('createGame');
    };
    
    const joinGame = (id) => {
        setGameId(id);
        socket.emit('joinGame', id);
    };
    
    const makeMove = (index) => {
        if (game && hasJoined && game.currentPlayer === playerRole) {
            socket.emit('makeMove', { gameId, index, role: playerRole });
        }
    };

    const resetGame = () => {
        socket.emit('resetGame', gameId);
    };

    return (
        <div className="game-container">
            {!game && <>
                <button onClick={createGame}>Create Game</button>
                <input type='text' placeholder='Game ID' onBlur={(e) => joinGame(e.target.value)} />
            </>}

            {game && <div className="board">
                {game?.board?.map((cell, index) => (
                    <button key={index} className={`cell ${cell === 'X' ? 'x' : cell === 'O' ? 'o' : ''}`} onClick={() => makeMove(index)}>
                        {cell}
                    </button>
                ))}
            </div>}

            {game && <p style={{ marginTop: 30 }}>{game.currentPlayer}'s Turn</p>}
            {message && <p>{message}</p>}
            {allowReset && <button onClick={resetGame}>Reset Game</button>}
        </div>
    );
}

export default Game;
