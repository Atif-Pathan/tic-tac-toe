let markerXUsed = false;
let markerOUsed = false;
let playAgain = true;

// IIFE for the game board as we only need one instance of the game board
const gameBoard = (function() {
    let board = [];
    let oppositeDiagonal;

    const logGameBoard = () => {
        for (let i = 0; i < board.length; i++) {
            console.log(board[i]);
        }
        console.log("\n");
        
    }

    const resetBoard = () => {
        oppositeDiagonal = 0;
        for (let row = 0; row < 3; row++) {
            board[row] = [];
            board[row].push("", "", "", 0);   
        }
        board[3] = [];
        board[3].push(0, 0, 0, 0);
    }

    const getBoardCell = (row, col) => {
        console.log(board[row][col] + "\n");
    }

    const setBoardCell = (row, col, mark) => {
        if (board[row][col] === "") {
            board[row][col] = mark;
            return true;
        } else {
            console.log("Already marked cell, cant perform move\n");
            return false;
        }
    }

    const updateTally = (move, point) => {
        board[move[0]][3] += point;
        board[3][move[1]] += point;
        if (Math.abs(board[move[0]][3]) === 3 || Math.abs(board[3][move[1]]) === 3) {
            return true;
        }
        if (move[0] == move[1]) {
            board[3][3] += point
            if (Math.abs(board[3][3]) === 3) {
                return true;
            }
        }
        if (move[0] + move[1] === 2) {
            oppositeDiagonal += point;
            if(Math.abs(oppositeDiagonal) === 3) {
                return true;
            }
        }
        return false;
    }

    return {logGameBoard, getBoardCell, setBoardCell, updateTally, resetBoard};
})();

const gameManager = function(name1, name2) {
    const player1 = createPlayer(name1);
    const player2 = createPlayer(name2);
    let swap = true;
    let currentPlayer1 = false;
    let foundWinner = false;
    let blocksLeft = 9;

    const startGame = () => {
        while(getBlocksLeft() > 0) {
            let userInput = prompt("Enter your move in the format [row, column]:");
            userInput = userInput.replace(/[\[\]\s]/g, '');
            let moveArray = userInput.split(',').map(Number);
            if (!swap) {
                playRound((currentPlayer1 ? player1 : player2), moveArray);
            }
            else {
                playRound(swapPlayer(), moveArray);
            }
            if(foundWinner) {
                endGame();
                break;
            };
        }
    }

    const swapPlayer = () => {
        let temp = currentPlayer1;
        currentPlayer1 = !currentPlayer1;
        return temp ? player2 : player1;
    }

    const decrementBlocksLeft = () => blocksLeft--;
    const getBlocksLeft = () => blocksLeft;
    const setBlocksLeft = (num) => blocksLeft = num;

    const endGame = () => {
        console.log("GAME HAS ENDED, THE WINNER IS: ", currentPlayer1 ? player1.name : player2.name);
        resetGame();
    }

    const playRound = (currentPlayer, move) => {
        if(gameBoard.setBoardCell(move[0], move[1], currentPlayer.getMark())){
            let point = currentPlayer1 ? 1 : -1;
            foundWinner = gameBoard.updateTally(move, point);
            console.log("Successful move");
            gameBoard.logGameBoard();
            decrementBlocksLeft();
            swap = true;
        }
        else{
            swap = false;
        }
    }

    const resetGame = () => {
        console.log("Game Reset!");
        playAgain = !playAgain;
        markerXUsed = false;
        markerOUsed = false;
        gameBoard.resetBoard();
    }

    return {swapPlayer, playRound, player1, player2, currentPlayer1, getBlocksLeft, startGame, resetGame};

};

function createPlayer(name) {
    let playerMarker; 

    // assign a mark automatically when creating new player
    function assignMark() {
        if(!markerXUsed){
            playerMarker = "X";
            markerXUsed = true;
        } else {
            playerMarker = "O";
            markerOUsed = true;
        }
    }
    assignMark();

    // also be able to the set the mark, if needed
    // we will assume that no one can enter an invalid mark and that
    // the two players wont get the same mark
    const setMark = (mark) => {
        playerMarker = mark;
    }

    // return the mark of the current player
    const getMark = () => {
        return playerMarker;
    }

    return {setMark, getMark, name};
}


while (true) {
    gameBoard.resetBoard();
    let player1 = prompt("Enter P1 name:");
    let player2 = prompt("Enter P2 name:")

    currentGame = gameManager(player1, player2);
    console.log("P1: ", currentGame.player1.name, ", mark: ", currentGame.player1.getMark());
    console.log("P2: ", currentGame.player2.name, ", mark: ", currentGame.player2.getMark());

    while (playAgain) {
        currentGame.startGame();
    }

    playAgain = confirm("Game over! Do you want to play again?");
    if (!playAgain) {
        break;
    }
}