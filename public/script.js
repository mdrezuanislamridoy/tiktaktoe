// public/script.js
const socket = io();

let boxes = document.querySelectorAll(".box");
let reset = document.querySelector(".reset");
let playerType = "";
let currentTurn = ""; // Track current turn

socket.on("playerType", (type) => {
  playerType = type; // Store the player's type (X or O)
  console.log(`You are player ${playerType}`);
});

socket.on("yourTurn", () => {
  currentTurn = socket.id; // Set the current turn to the player
  console.log("It's your turn!");
  boxes.forEach((box) => {
    box.disabled = false; // Enable all boxes
  });
});

boxes.forEach((box, index) => {
  box.addEventListener("click", () => {
    if (box.innerText === "" && currentTurn === socket.id) {
      // Ensure it's the player's turn
      socket.emit("move", index); // Emit move to the server
      box.disabled = true; // Disable the clicked box immediately
    }
  });
});

socket.on("moveMade", (data) => {
  boxes[data.index].innerText = data.player; // Update the UI with the player's move
});

socket.on("turnChange", (nextTurn) => {
  currentTurn = nextTurn; // Update current turn
  if (currentTurn !== socket.id) {
    boxes.forEach((box) => {
      box.disabled = true; // Disable boxes for the non-current player
    });
  } else {
    boxes.forEach((box) => {
      if (box.innerText === "") {
        box.disabled = false; // Enable boxes for the current player
      }
    });
  }
});

socket.on("gameOver", (winner) => {
  if (winner === "Draw") {
    alert("It's a Draw!");
  } else {
    alert(`Player ${winner} wins!`);
  }
  resetBoard(); // Reset the board after the game ends
});

reset.addEventListener("click", () => {
  socket.emit("reset"); // Emit reset to the server
});

socket.on("reset", () => {
  resetBoard(); // Reset the UI board
});

const resetBoard = () => {
  boxes.forEach((box) => {
    box.innerText = ""; // Clear the text
    box.disabled = false; // Enable all boxes
  });
};
