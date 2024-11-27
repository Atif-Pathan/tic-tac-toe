let markerXUsed = false;
let markerOUsed = false;
let playAgain = true;
let currentGame = null;

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
    const grid = document.querySelector(".grid");
    const playerForm = document.getElementById("player-names");
    const displayTurn = document.querySelector(".player-turn");
    const btns = document.querySelector(".btns");
    let swap = true;
    let currentPlayer1 = false;
    let foundWinner = false;
    let blocksLeft = 9;

    const playAgainButton = document.getElementById('play-again');
    playAgainButton.addEventListener('click', () => {
        displayTurn.style.display = "none";
        btns.style.display = "none";
        resetGame(); // Call the reset function
    });

    const editNamesButton = document.getElementById('edit-names');
    editNamesButton.addEventListener('click', () => {     
        playerForm.style.display = "flex";
        grid.style.display = "none";
        displayTurn.style.display = "none";
        btns.style.display = "none";
    });

    const startGame = () => {
        // Add a click event listener to each button
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                let i = button.id.slice(-1);
                let row = Math.floor(i / 3);
                let col = i % 3;
                let moveArray = [row, col];       
                         
                if (!swap) {
                    playRound((currentPlayer1 ? player1 : player2), moveArray);
                    // displayTurn.style.display = "block";
                    // displayTurn.textContent = currentPlayer1 ? `${player2.getName()}'s turn (${player2.getMark()})` : `${player1.getName()}'s turn (${player1.getMark()})`; 
                }
                else {
                    playRound(swapPlayer(), moveArray);
                    // displayTurn.style.display = "block";
                    // displayTurn.textContent = currentPlayer1 ? `${player1.getName()}'s turn (${player1.getMark()})` : `${player2.getName()}'s turn (${player2.getMark()})`; 
                }

                if(foundWinner) {
                    displayTurn.textContent = "";
                    endGame(false);
                }
                else if(getBlocksLeft() === 0) {
                    displayTurn.textContent = "";
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
            displayController.displayWinner(currentPlayer1 ? player1.getName() : player2.getName())
        }
        buttons.forEach(button => button.disabled = true);
        btns.style.display = "flex";
    }

    const playRound = (currentPlayer, move) => {
        // console.log("current player 1 = ", currentPlayer1);
        if(gameBoard.setBoardCell(move[0], move[1], currentPlayer.getMark())){
            let point = currentPlayer1 ? 1 : -1;
            foundWinner = gameBoard.updateTally(move, point);
            console.log("Successful move");
            gameBoard.logGameBoard();
            decrementBlocksLeft();
            swap = true;
            displayController.updateBoard();
            displayTurn.style.display = "block";
            displayTurn.textContent = currentPlayer1 ? `${player2.getName()}'s turn (${player2.getMark()})` : `${player1.getName()}'s turn (${player1.getMark()})`; 
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
        buttons.forEach(button => button.disabled = false);
        displayTurn.style.display = "block";
        displayTurn.textContent = `${player1.getName()}'s turn (X)`;
    }

    return {swapPlayer, playRound, player1, player2, currentPlayer1, getBlocksLeft, startGame, resetGame};
};

function createPlayer(name) {
    let playerMarker; 
    let playerName = name;

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
        playerName = newName;
    }

    const getName = () => {
        return playerName;
    }

    // return the mark of the current player
    const getMark = () => {
        return playerMarker;
    }

    return {setName, getMark, getName};
}

const displayController = (function() {
    const displayResult = document.querySelector(".player-turn");
    
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
        }
    }

    const displayWinner = (name) => {
        displayResult.style.display = 'block';
        displayResult.innerHTML = `The WINNER is <strong><u>${name}</u></strong>!`;
    }

    const displayTie = () => {
        displayResult.style.display = 'block';
        displayResult.innerHTML = "The game ended in a TIE!";
    }

    return {updateBoard, resetBoard, displayWinner, displayTie};
    
})();

const getPlayerNames = (function() {
    const playerForm = document.getElementById("player-names");
    const grid = document.querySelector(".grid");
    const displayTurn = document.querySelector(".player-turn");
    
    playerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        new FormData(playerForm);
    })
    
    playerForm.addEventListener("formdata", (e) => {
        const data = e.formData;
        getPlayerNames(data);
    })

    const getPlayerNames = (data) => {
        let player1 = data.get("player1").toUpperCase();
        let player2 = data.get("player2").toUpperCase();
        gameBoard.resetBoard();
        playerForm.style.display = "None";
        if(!currentGame) {
            currentGame = gameManager(player1, player2);
            currentGame.startGame();
        }
        else {
            currentGame.player1.setName(player1);
            currentGame.player2.setName(player2);
        }
        currentGame.resetGame();
        grid.style.display = "grid";
        displayTurn.style.display = "block";
        displayTurn.textContent = `${player1}'s turn (X)`;
    }

    return {};

})();