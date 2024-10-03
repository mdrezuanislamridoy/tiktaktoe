// public/script.js
const socket = io();

let boxes = document.querySelectorAll(".box");
let reset = document.querySelector(".reset");
let playerType = "";

socket.on("playerType", (type) => {
  playerType = type; // Store the player's type (X or O)
  console.log(`You are player ${playerType}`);
});

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    const index = box.getAttribute("data-index");
    socket.emit("move", index); // Emit move to the server
  });
});

socket.on("moveMade", (data) => {
  boxes[data.index].innerText = data.player; // Update the UI with the player's move
  boxes[data.index].disabled = true; // Disable the clicked box
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
