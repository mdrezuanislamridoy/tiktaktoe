// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let players = {};
let board = Array(9).fill(""); // Initialize the game board

io.on("connection", (socket) => {
  console.log("A user connected");

  // Assign player type (X or O)
  if (Object.keys(players).length < 2) {
    players[socket.id] = Object.keys(players).length === 0 ? "O" : "X";
    socket.emit("playerType", players[socket.id]);
  } else {
    socket.emit("message", "Game is full. Please wait.");
    socket.disconnect();
  }

  // Listen for moves
  socket.on("move", (index) => {
    if (board[index] === "") {
      board[index] = players[socket.id]; // Update the board with the player's move
      io.emit("moveMade", { index, player: players[socket.id] });
      checkWinner(); // Check for a winner after each move
    }
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    delete players[socket.id];
  });

  // Reset the game
  socket.on("reset", () => {
    board = Array(9).fill("");
    io.emit("reset");
  });
});

// Function to check for a winner
const checkWinner = () => {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let winner = null;

  for (let pattern of winningCombinations) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winner = board[a]; // Set the winner
      break;
    }
  }

  if (winner) {
    io.emit("gameOver", winner); // Notify all players of the winner
  } else if (!board.includes("")) {
    io.emit("gameOver", "Draw"); // Notify all players of a draw
  }
};

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
