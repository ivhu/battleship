const ships = ['destroyer', 'submarine', 'cruiser', 'battleship', 'carrier'];
const shipLengths = {
  destroyer: 2,
  submarine: 3,
  cruiser: 3,
  battleship: 4,
  carrier: 5,
};
let width = 10;
let gameData = {
  player_destroyer: [],
  player_submarine: [],
  player_cruiser: [],
  player_battleship: [],
  player_carrier: [],

  computer_destroyer: [],
  computer_submarine: [],
  computer_cruiser: [],
  computer_battleship: [],
  computer_carrier: [],
};

function Gameboard() {
  const rows = 10;
  const columns = 10;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell(i, j));
    }
  }

  return board;
}

function Cell(i, j) {
  let coords = `${i}${j}`;
  let isHit = false;
  let isOccupied = false;
  let occupiedBy = '';

  return {
    coords,
    isHit,
    isOccupied,
    occupiedBy,
  };
}

function generateRandomStartCoord() {
  let randomStartCoord = Math.floor(Math.random() * width * width).toString();
  if (randomStartCoord.length === 1) {
    randomStartCoord = '0' + randomStartCoord;
  }
  return randomStartCoord;
}

function generateRandomBoolean() {
  return Math.random() < 0.5;
}

function handleValidity(startCoord, isHorizontal, board, length) {
  function shipInBounds(startCoord) {
    if (isHorizontal) {
      if (
        parseInt(startCoord.charAt(1)) + (length - 1) >=
        board[parseInt(startCoord.charAt(0))].length
      ) {
        return false;
      }
      return true;
    } else {
      if (parseInt(startCoord.charAt(0)) + (length - 1) >= board.length) {
        return false;
      }
      return true;
    }
  }

  function shipCanFit(startCoord) {
    if (!shipInBounds(startCoord)) {
      return false;
    }
    if (isHorizontal) {
      for (let i = 0; i < length; i++) {
        if (
          board[parseInt(startCoord.charAt(0))][
            parseInt(startCoord.charAt(1)) + i
          ].isOccupied
        ) {
          return false;
        }
      }
      return true;
    } else {
      for (let i = 0; i < length; i++) {
        if (
          board[parseInt(startCoord.charAt(0)) + i][
            parseInt(startCoord.charAt(1))
          ].isOccupied
        ) {
          return false;
        }
      }
      return true;
    }
  }

  return shipCanFit(startCoord);
}

let angle = 0;
const flipBtn = document.querySelector('.flip-btn');
const optionsDiv = document.querySelector('.options');
flipBtn.addEventListener('click', () => {
  const shipOptions = Array.from(optionsDiv.children);
  angle = angle === 0 ? 90 : 0;
  shipOptions.forEach(
    (shipOption) => (shipOption.style.transform = `rotate(${angle}deg)`)
  );
});

function placeShipOnBoard(user, board, ship, tryCoord) {
  let isHorizontal = user === 'player' ? angle === 0 : generateRandomBoolean();
  let startCoord = tryCoord ? tryCoord : generateRandomStartCoord();
  let length = shipLengths[ship];

  while (!handleValidity(startCoord, isHorizontal, board, length)) {
    if (user === 'computer') startCoord = generateRandomStartCoord();
  }
  const row = parseInt(startCoord.charAt(0));
  const col = parseInt(startCoord.charAt(1));
  for (let i = 0; i < length; i++) {
    let cell;
    if (isHorizontal) {
      cell = board[row][col + i];
    } else {
      cell = board[row + i][col];
    }
    cell.isOccupied = true;
    cell.occupiedBy = ship;
  }
}

let draggedShip;
const shipOptions = Array.from(optionsDiv.children);
shipOptions.forEach((shipOption) => {
  shipOption.addEventListener('dragstart', dragStart);
});
function dragStart(e) {
  draggedShip = e.target;
}

function ScreenController(user, board) {
  const boardDiv = document.querySelector(`.${user}-board`);
  boardDiv.innerHTML = '';
  board.forEach((row) =>
    row.forEach((cell) => {
      const cellButton = document.createElement('button');
      cellButton.classList.add('cell');
      // cellButton.textContent = cell.coords;
      cellButton.id = cell.coords + user;
      boardDiv.appendChild(cellButton);
      if (cell.isOccupied) {
        switch (cell.occupiedBy) {
          case 'destroyer':
            cellButton.classList.add('destroyer');
            break;
          case 'submarine':
            cellButton.classList.add('submarine');
            break;
          case 'cruiser':
            cellButton.classList.add('cruiser');
            break;
          case 'battleship':
            cellButton.classList.add('battleship');
            break;
          case 'carrier':
            cellButton.classList.add('carrier');
        }
      }
    })
  );

  const allPlayerBtns = document.querySelectorAll('.player-board .cell');
  for (let i = 0; i < allPlayerBtns.length; i++) {
    let cell = allPlayerBtns[i];
    cell.addEventListener('dragover', dragOver);
    cell.addEventListener('drop', dropShip);
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function dropShip(e) {
    const startCoord = e.target.id;
    const ship = draggedShip.id;

    let isHorizontal = angle === 0;
    let length = shipLengths[ship];
    let board = playerBoard;

    if (handleValidity(startCoord, isHorizontal, board, length)) {
      placeShipOnBoard('player', board, ship, startCoord);
      draggedShip.remove();
      //update playerBoard after each ship piece is placed
      ScreenController('player', playerBoard);
      //check if all pieces have been placed
      if (optionsDiv.children.length === 0) {
        document.querySelector('.start-btn').disabled = false;
      }
    }
  }
}

let playerBoard = Gameboard();
let computerBoard = Gameboard();

ships.forEach((ship) => placeShipOnBoard('computer', computerBoard, ship));

//initial render
ScreenController('computer', computerBoard);
ScreenController('player', playerBoard);

const turnDiv = document.querySelector('.turn');
const playerBoardDiv = document.querySelector('.player-board');
const computerBoardDiv = document.querySelector('.computer-board');
const players = ['Player', 'Computer'];
let activePlayer = players[1];

const startBtn = document.querySelector('.start-btn');
const resetBtn = document.querySelector('.reset-btn');
startBtn.disabled = true;
startBtn.addEventListener('click', () => startGame());

function computerClicksPlayerBoard() {
  let validCoord = generateRandomStartCoord();
  while (
    playerBoard[parseInt(validCoord.charAt(0))][parseInt(validCoord.charAt(1))]
      .isHit
  ) {
    validCoord = generateRandomStartCoord();
  }
  document.getElementById(validCoord + 'player').click();
}

function startGame() {
  playerBoard.forEach((row) => {
    row.forEach((cell) => {
      let cellButton = document.getElementById(`${cell.coords}player`);
      cellButton.addEventListener('click', () =>
        handleClick(cell, cellButton, 'player')
      );
    });
  });

  computerBoard.forEach((row) => {
    row.forEach((cell) => {
      let cellButton = document.getElementById(`${cell.coords}computer`);
      cellButton.addEventListener('click', () =>
        handleClick(cell, cellButton, 'computer')
      );
    });
  });

  function handleClick(cell, cellButton, user) {
    const msg = document.querySelector('.msg');
    cell.isHit = true;
    cellButton.disabled = true;
    if (cell.isOccupied) {
      cellButton.classList.add('hit');
      msg.textContent = `${user}'s ${cell.occupiedBy} has been hit!`;
      gameData[user + '_' + cell.occupiedBy].push(cell.coords);
      if (
        gameData[user + '_' + cell.occupiedBy].length ===
        shipLengths[cell.occupiedBy]
      ) {
        msg.textContent = `${user}'s ${cell.occupiedBy} has been SUNK!`;
      }
    } else {
      cellButton.classList.add('hit');
      msg.textContent = '';
    }
  }

  startBtn.style.display = 'none';
  turnDiv.textContent = `${activePlayer}'s turn`;
  if (activePlayer !== 'Player') {
    computerClicksPlayerBoard();
    turnDiv.textContent = `Player's turn`;
  }
  playerBoardDiv.style.pointerEvents = 'none';
  computerBoardDiv.style.pointerEvents = 'auto';

  computerBoardDiv.addEventListener('click', () => {
    if (checkLoss('computer')) {
      turnDiv.textContent = `All of Computer's ships have been SUNK. Player wins!`;
      playerBoardDiv.style.pointerEvents = 'none';
      computerBoardDiv.style.pointerEvents = 'none';
    } else {
      //switch player turn
      turnDiv.textContent = `Computer is thinking...`;
      computerBoardDiv.style.pointerEvents = 'none';
      // playerBoardDiv.style.pointerEvents = 'auto';
      setTimeout(() => {
        computerClicksPlayerBoard();
      }, '2000');
    }
  });

  playerBoardDiv.addEventListener('click', () => {
    if (checkLoss('player')) {
      turnDiv.textContent = `All of Player's ships have been SUNK. Computer wins!`;
      playerBoardDiv.style.pointerEvents = 'none';
      computerBoardDiv.style.pointerEvents = 'none';
    } else {
      //switch player turn
      turnDiv.textContent = `Player's turn`;
      playerBoardDiv.style.pointerEvents = 'none';
      computerBoardDiv.style.pointerEvents = 'auto';
    }
  });

  function checkLoss(user) {
    for (let ship of ships) {
      if (gameData[user + '_' + ship].length !== shipLengths[ship]) {
        return false;
      }
    }
    return true;
  }
}
