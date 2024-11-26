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
        // console.log(board[row][col] + "\n");
        return board[row][col];
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
    const buttons = document.querySelectorAll('.tile');
    let swap = true;
    let currentPlayer1 = false;
    let foundWinner = false;
    let blocksLeft = 9;

    const playAgainButton = document.getElementById('play-again');
    playAgainButton.addEventListener('click', () => {
        resetGame(); // Call the reset function
        playAgainButton.style.display = 'none'; // Hide the button after resetting
        buttons.forEach(button => button.disabled = false); // Re-enable game interaction
    });

    const startGame = () => {
        // Add a click event listener to each button
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                let i = button.id.slice(-1);
                let row = Math.floor(i / 3);
                let col = i % 3;
                let moveArray = [row, col];
                console.log('Button clicked:', button);
                if (!swap) {
                    playRound((currentPlayer1 ? player1 : player2), moveArray);
                }
                else {
                    playRound(swapPlayer(), moveArray);
                }

                if(foundWinner) {
                    endGame(false);
                }
                else if(getBlocksLeft() === 0) {
                    // means there is a tie, as no winner was found
                    endGame(true);
                }
            });
        });
    }

    const swapPlayer = () => {
        let temp = currentPlayer1;
        currentPlayer1 = !currentPlayer1;
        return temp ? player2 : player1;
    }

    const decrementBlocksLeft = () => blocksLeft--;
    const getBlocksLeft = () => blocksLeft;
    const setBlocksLeft = (num) => blocksLeft = num;

    const endGame = (tie) => {
        if (tie) {
            displayController.displayTie();
        } else {
            displayController.displayWinner(currentPlayer1 ? player1.name : player2.name)
        }
        const playAgainButton = document.getElementById('play-again');
        playAgainButton.style.display = 'block';
        buttons.forEach(button => button.disabled = true);
    }

    const playRound = (currentPlayer, move) => {
        if(gameBoard.setBoardCell(move[0], move[1], currentPlayer.getMark())){
            let point = currentPlayer1 ? 1 : -1;
            foundWinner = gameBoard.updateTally(move, point);
            console.log("Successful move");
            gameBoard.logGameBoard();
            decrementBlocksLeft();
            swap = true;
            displayController.updateBoard();
        }
        else{
            swap = false;
        }
    }

    const resetGame = () => {
        console.log("Game Reset!");
        setBlocksLeft(9);
        playAgain = !playAgain;
        swap = true;
        currentPlayer1 = false;
        foundWinner = false;
        markerXUsed = false;
        markerOUsed = false;
        displayController.resetBoard();
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

    // also be able to the set the name, if needed
    // we will assume that no one can enter an invalid name and that
    // the two players wont get the same name
    const setName = (newName) => {
        name = newName;
    }

    // return the mark of the current player
    const getMark = () => {
        return playerMarker;
    }

    return {setName, getMark, name};
}

const displayController = (function() {
    const displayResult = document.querySelector(".winner");
    
    const updateBoard = () => {
        for (let i = 0; i < 9; i++) {
            let idName = `tile-${i}`;
            let tile = document.getElementById(idName);
            let row = Math.floor(i / 3);
            let col = i % 3;
            tile.textContent = `${gameBoard.getBoardCell(row, col)}`;
        }
    }

    const resetBoard = () => {
        for (let i = 0; i < 9; i++) {
            let idName = `tile-${i}`;
            let tile = document.getElementById(idName);
            tile.textContent = "";
            displayResult.style.display = 'none';
        }
    }

    const displayWinner = (name) => {
        displayResult.style.display = 'block';
        displayResult.textContent = `The winner is ${name}!`;
    }

    const displayTie = () => {
        displayResult.style.display = 'block';
        displayResult.textContent = "The game ended in a Tie!";
    }

    return {updateBoard, resetBoard, displayWinner, displayTie};
    
})();


gameBoard.resetBoard();
let player1 = prompt("Enter P1 name:");
let player2 = prompt("Enter P2 name:")

currentGame = gameManager(player1, player2);
console.log("P1: ", currentGame.player1.name, ", mark: ", currentGame.player1.getMark());
console.log("P2: ", currentGame.player2.name, ", mark: ", currentGame.player2.getMark());

currentGame.startGame();