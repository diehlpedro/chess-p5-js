// todo: add isCheck logic

// Configs for the chessboard
let width = document.documentElement.clientWidth;
if (width > 1000) width = 1000;
const canvasSize = width - 30;
const squareSize = canvasSize / 8;
const fontSmall = canvasSize / 50;
const fontLarge = canvasSize / 25;

// Variables
let isGameOver = false;
let lastClick = null;
let selectedPiecePosition = false;
let selectedPiece = false; // Selected piece from click
let selectedSlot = null; // Selected chess slot from click
let pieces = []; // Pieces array
let allowedMoves = []; // Array to store the allowed moves
let allowedTakes = []; // Array to store the allowed takes
let isBlackTurn = false; // false = WHITE | true = BLACK
let logs = []; // Array to store the play history
let showLogs = true; // Show logs in the DOM
let showNotation = false; // Show algebraic notation on the board
let showHighlights = true; // Show highlights for allowed moves and takes

// Setup function from p5.js
function setup() {
  createCanvas(canvasSize, canvasSize).parent('chess-board');
  textFont("Calibri");
  createPieces();
}

// Draw function from p5.js
function draw() {
  drawBoard();
  for (const piece of pieces) {
    piece.selfDraw();
  }
  if (selectedPiecePosition !== false && !isGameOver) {
    highlightSpot(selectedPiecePosition.spot);
    checkPieceMoves(selectedPiece);

    if (showHighlights) {
      for (const move of allowedMoves) {
        highlightSpot(move);
      }
      for (const take of allowedTakes) {
        highlightTake(take.position);
      }
    }
  }
}

function drawBoard() {
  let color = false;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      fill(color ? 25 : 220);
      color = !color;
      rect(j * squareSize, i * squareSize, squareSize, squareSize);
      fill(200, 50, 50);

      textSize(fontSmall);
      if (showNotation) {
        text(convertToLetter(j + 1) + ' ' + (9 - (i + 1)), j * squareSize + 2, i * squareSize + (squareSize - 2));
      }
    }
    color = !color;
  }
}

function createPieces() {
  // Create pawns
  for (let i = 0; i < 8; i++) {
    pieces.push(new Piece('P', i + 1, 2, false));
    pieces.push(new Piece('P', i + 1, 7, true));
  }

  // Create rooks
  pieces.push(new Piece('R', 1, 8, true));
  pieces.push(new Piece('R', 8, 8, true));
  pieces.push(new Piece('R', 8, 1, false));
  pieces.push(new Piece('R', 1, 1, false));

  // Create knights
  pieces.push(new Piece('N', 2, 8, true));
  pieces.push(new Piece('N', 7, 8, true));
  pieces.push(new Piece('N', 7, 1, false));
  pieces.push(new Piece('N', 2, 1, false));

  // Create bishops
  pieces.push(new Piece('B', 3, 8, true));
  pieces.push(new Piece('B', 6, 8, true));
  pieces.push(new Piece('B', 6, 1, false));
  pieces.push(new Piece('B', 3, 1, false));

  // Create kings and queens
  pieces.push(new Piece('K', 4, 8, true));
  pieces.push(new Piece('Q', 5, 8, true));
  pieces.push(new Piece('K', 4, 1, false));
  pieces.push(new Piece('Q', 5, 1, false));
}

function checkPieceMoves(piece) {
  allowedMoves = [];
  allowedTakes = [];

  switch (piece.type) {
    case 'P':
      checkPawnMoves(piece);
      break;

    case 'R':
      checkRookMoves(piece);
      break;

    case 'N':
      checkKnightMoves(piece);
      break;

    case 'B':
      checkBishopMoves(piece);
      break;

    case 'Q':
      checkRookMoves(piece);
      checkBishopMoves(piece);
      break;

    case 'K':
      checkRookMoves(piece, true);
      checkBishopMoves(piece, true);
      break;

    default:
      break;
  }
}

function checkBishopMoves(piece, isKing = false) {
  const possibleDirections = [
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 }
  ];

  for (const direction of possibleDirections) {
    let x = piece.position.x;
    let y = piece.position.y;

    while (true) {
      // Check next diagonal until out of board or until find an allowedTake
      x += direction.x;
      y += direction.y;

      if (x < 1 || x > 8 || y < 1 || y > 8) break; // Out of board

      const foundPiece = checkPiece(x, y);
      if (foundPiece === false) {
        allowedMoves.push(convertToLetter(x) + y); // No piece
        if (isKing) break; // If king stop checking further
      } else {
        if (foundPiece.color !== piece.color) {
          allowedTakes.push(foundPiece); // Found piece to take
          if (isKing) break; // If king stop checking further
        }
        break; // Stop checking further in this direction
      }
    }
  }
}

function checkRookMoves(piece, isKing = false) {
  const possibleDirections = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  for (const direction of possibleDirections) {
    let x = piece.position.x;
    let y = piece.position.y;

    while (true) {
      // Check next position until out of board or until find an allowedTake
      x += direction.x;
      y += direction.y;

      if (x < 1 || x > 8 || y < 1 || y > 8) break; // Out of board

      const foundPiece = checkPiece(x, y);
      if (foundPiece === false) {
        allowedMoves.push(convertToLetter(x) + y); // No piece
        if (isKing) break; // If king stop checking further
      } else {
        if (foundPiece.color !== piece.color) {
          allowedTakes.push(foundPiece); // Found piece to take
          if (isKing) break; // If king stop checking further
        }
        break; // Stop checking further in this direction
      }
    }
  }
}

function checkKnightMoves(piece) {
  const possibleHorseMoves = [
    { x: 1, y: 2 },
    { x: 2, y: 1 },
    { x: -1, y: 2 },
    { x: -2, y: 1 },
    { x: 1, y: -2 },
    { x: 2, y: -1 },
    { x: -1, y: -2 },
    { x: -2, y: -1 }
  ];
  for (const move of possibleHorseMoves) {
    const newX = piece.position.x + move.x;
    const newY = piece.position.y + move.y;
    if (newX >= 1 && newX <= 8 && newY >= 1 && newY <= 8) {
      const foundPiece = checkPiece(newX, newY);
      if (foundPiece === false) {
        allowedMoves.push(convertToLetter(newX) + newY);
      } else {
        if (foundPiece.color !== piece.color) {
          allowedTakes.push(foundPiece);
        }
      }
    }
  }
}

function checkPawnMoves(piece) {
  const moveDirection = piece.color ? -1 : 1; // -1 for black, 1 for white
  const moveTwoSteps = moveDirection * 2;

  // Check forward to MOVE
  const forwardPiece = checkPiece(piece.position.x, piece.position.y + moveDirection);
  if (forwardPiece === false) {
    allowedMoves.push(convertToLetter(piece.position.x) + (piece.position.y + moveDirection));

    // Check possibility to move 2x forward on first pawn play
    if (!piece.moved) {
      if (checkPiece(piece.position.x, piece.position.y + moveTwoSteps) === false) {
        allowedMoves.push(convertToLetter(piece.position.x) + (piece.position.y + moveTwoSteps));
      }
    }
  }

  // Check diagonals for takes
  const diagRightPiece = checkPiece(piece.position.x + 1, piece.position.y + moveDirection);
  const diagLeftPiece = checkPiece(piece.position.x - 1, piece.position.y + moveDirection);
  if (diagRightPiece !== false && diagRightPiece.color !== isBlackTurn) {
    allowedTakes.push(diagRightPiece);
  }
  if (diagLeftPiece !== false && diagLeftPiece.color !== isBlackTurn) {
    allowedTakes.push(diagLeftPiece);
  }
}

function checkPiece(x, y) {
  for (const piece of pieces) {
    if (piece.position.x === x && piece.position.y === y) {
      return piece;
    }
  }
  return false;
}

function checkTake(move) {
  // todo: add isCheck logic
  const xy = convertSpot(move);
  const foundPiece = checkPiece(xy.x, xy.y);
  if (foundPiece === false) return false;
  if (foundPiece.color === isBlackTurn) return false;
  return foundPiece;
}

function takePiece(x, y) {
  for (let i = pieces.length - 1; i >= 0; i--) {
    if (pieces[i].position.x === x && pieces[i].position.y === y) {
      // Check if piece is King
      if (pieces[i].type === 'K') {
        isGameOver = true;
        document.getElementById('turn').innerHTML = `Game Over. ${dictionaryLog(selectedPiece.color)} WINS!`;
      }
      pieces.splice(i, 1);
      return;
    }
  }
}

function highlightTake(spot) {
  fill(255, 30, 30, 100);
  rect(spot.x * squareSize - squareSize, canvasSize - squareSize * spot.y, squareSize);
}

function highlightSpot(spot) {
  spot = convertSpot(spot);
  fill(30, 255, 30, 100);
  rect(spot.x * squareSize - squareSize, canvasSize - squareSize * spot.y, squareSize);
}

function convertSpot(s) {
  let x = s.substring(0, 1);
  x = convertToNumber(x);
  let y = parseInt(s.substring(1));
  return { x: x, y: y };
}

function convertToLetter(number) {
  switch (number) {
    case 1: return 'A';
    case 2: return 'B';
    case 3: return 'C';
    case 4: return 'D';
    case 5: return 'E';
    case 6: return 'F';
    case 7: return 'G';
    case 8: return 'H';
    default: return null;
  }
}

function convertToNumber(letter) {
  switch (letter) {
    case 'A': return 1;
    case 'B': return 2;
    case 'C': return 3;
    case 'D': return 4;
    case 'E': return 5;
    case 'F': return 6;
    case 'G': return 7;
    case 'H': return 8;
    default: return null;
  }
}

function resetVariables() {
  selectedPiece = false;
  selectedPiecePosition = false;
  allowedMoves = [];
  allowedTakes = [];
}

function restartGame() {
  lastClick = null;
  selectedSlot = null;
  isBlackTurn = false;
  pieces = [];
  resetVariables();
  createPieces();
  logs = [];
  showPlays();
  isGameOver = false;
  document.getElementById('turn').innerHTML = 'WHITE TURN';
}

function turnDomChange() {
  const turnDom = document.getElementById('turn');
  if (isBlackTurn) {
    turnDom.innerHTML = 'BLACK TURN';
  } else {
    turnDom.innerHTML = 'WHITE TURN';
  }
  document.getElementsByTagName('body')[0].classList.toggle('white');
  document.getElementsByTagName('body')[0].classList.toggle('black');
}

function dictionaryLog(word) {
  switch (word) {
    case 'P': return 'Pawn';
    case 'R': return 'Rook';
    case 'N': return 'Knight';
    case 'B': return 'Bishop';
    case 'Q': return 'Queen';
    case 'K': return 'King';
    case false: return 'White';
    case true: return 'Black';
    default: break;
  }
}

function genLog(txt, color, isTake) {
  const colorText = color ? 'black' : 'white';
  logs.push({ text: txt, color: colorText, isTake: isTake });
  showPlays();
}

function showPlays() {
  let isTakeClass = '';
  if (showLogs) {
    let html = '';
    for (const log of logs) {
      isTakeClass = log.isTake ? 'take' : '';
      html += `<p class="${log.color}-p ${isTakeClass}">${log.text}</p>`;
    }
    document.getElementById('plays').innerHTML = html;
  } else {
    document.getElementById('plays').innerHTML = '';
  }
}

// Function to handle mouse clicks inside the chessboard
function mouseClicked() {
  if (isGameOver) return; // If game ended, do not allow further moves
  if (mouseX >= 0 && mouseX <= canvasSize && mouseY >= 0 && mouseY <= canvasSize) {
    const x = parseInt(mouseX / squareSize) + 1;
    const y = 8 - parseInt(mouseY / squareSize);
    const pos = convertToLetter(x) + y;
    let isMove = false;
    lastClick = { x: x, y: y, spot: pos };

    // Piece take check
    for (let i = allowedTakes.length - 1; i >= 0; i--) {
      if (allowedTakes[i].position.x === lastClick.x && allowedTakes[i].position.y === lastClick.y) {
        takePiece(lastClick.x, lastClick.y);
        isMove = true;
        genLog(`${dictionaryLog(selectedPiece.color)} ${dictionaryLog(selectedPiece.type)} at ${selectedPiecePosition.spot} took ${dictionaryLog(allowedTakes[i].type)} at ${pos}`,
          selectedPiece.color,
          true);
      }
    }

    // Piece move check
    if (allowedMoves.length > 0 && allowedMoves.includes(pos)) {
      isMove = true;
      genLog(`${dictionaryLog(selectedPiece.color)} ${dictionaryLog(selectedPiece.type)} at ${selectedPiecePosition.spot} moved to ${pos}`,
        selectedPiece.color,
        false);
    }

    // If isMove, update piece position
    if (isMove) {
      selectedPiece.position.x = x;
      selectedPiece.position.y = y;
      selectedPiece.moved = true;

      // Pawn promotion
      if (selectedPiece.type === 'P' && !isGameOver && (selectedPiece.position.y === 8 || selectedPiece.position.y === 1)) {
        selectedPiece.type = 'Q';
        genLog(`${dictionaryLog(selectedPiece.color)} promoted pawn at ${pos} to ${dictionaryLog(selectedPiece.type)}`, selectedPiece.color, false);
      }

      if (!isGameOver) {
        resetVariables();
        isBlackTurn = !isBlackTurn;
        turnDomChange();
      }
      return;
    }

    const pieceAtPosition = checkPiece(x, y);
    if (pieceAtPosition !== false) {
      if (pieceAtPosition.color === isBlackTurn) {
        selectedPiecePosition = { x: x, y: y, spot: convertToLetter(x) + y };
        selectedPiece = pieceAtPosition;
      } else {
        resetVariables();
      }
    } else {
      resetVariables();
    }
    selectedSlot = { x: x, y: y, spot: convertToLetter(x) + y };
  }

  return false;
}

class Piece {
  constructor(type, x, y, isBlack) {
    this.type = type;
    this.position = { x, y };
    this.color = isBlack;
    this.moved = false;
  }

  selfDraw() {
    if (this.color) {
      fill(60);
    } else {
      fill(255);
    }
    circle(this.position.x * squareSize - (squareSize / 2), (canvasSize + (squareSize / 2)) - squareSize * this.position.y, squareSize / 1.5);

    fill(255);
    if (!this.color) fill(0);
    textSize(fontLarge);
    text(this.type, this.position.x * squareSize - (squareSize * 0.6), (canvasSize + (squareSize * 0.6)) - squareSize * this.position.y);
  }
}
