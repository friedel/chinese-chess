class ChineseChess {
    constructor() {
        this.board = this.createBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.isComputerMode = false;
        this.setupBoard();
        this.setupEventListeners();
        this.redCaptured = document.getElementById('redCaptured');
        this.blackCaptured = document.getElementById('blackCaptured');
    }

    createBoard() {
        const board = document.getElementById('board');
        const cells = [];
        
        for (let row = 0; row < 10; row++) {
            cells[row] = [];
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                board.appendChild(cell);
                cells[row][col] = cell;
            }
        }
        return cells;
    }

    setupBoard() {
        // Initial piece positions
        const initialSetup = {
            red: {
                chariot: [[9, 0], [9, 8]],
                horse: [[9, 1], [9, 7]],
                elephant: [[9, 2], [9, 6]],
                advisor: [[9, 3], [9, 5]],
                general: [[9, 4]],
                cannon: [[7, 1], [7, 7]],
                soldier: [[6, 0], [6, 2], [6, 4], [6, 6], [6, 8]]
            },
            black: {
                chariot: [[0, 0], [0, 8]],
                horse: [[0, 1], [0, 7]],
                elephant: [[0, 2], [0, 6]],
                advisor: [[0, 3], [0, 5]],
                general: [[0, 4]],
                cannon: [[2, 1], [2, 7]],
                soldier: [[3, 0], [3, 2], [3, 4], [3, 6], [3, 8]]
            }
        };

        // Place pieces on the board
        for (const [color, pieces] of Object.entries(initialSetup)) {
            for (const [pieceType, positions] of Object.entries(pieces)) {
                positions.forEach(([row, col]) => {
                    this.createPiece(pieceType, color, row, col);
                });
            }
        }
    }

    createPiece(type, color, row, col) {
        const piece = document.createElement('div');
        piece.className = `piece ${color}`;
        piece.dataset.type = type;
        piece.dataset.color = color;
        
        // Unicode characters for pieces
        const symbols = {
            red: {
                general: '帥',
                advisor: '仕',
                elephant: '相',
                horse: '馬',
                chariot: '車',
                cannon: '炮',
                soldier: '兵'
            },
            black: {
                general: '將',
                advisor: '士',
                elephant: '象',
                horse: '馬',
                chariot: '車',
                cannon: '炮',
                soldier: '卒'
            }
        };

        piece.textContent = symbols[color][type];
        this.board[row][col].appendChild(piece);
    }

    setupEventListeners() {
        this.board.forEach(row => {
            row.forEach(cell => {
                cell.addEventListener('click', () => this.handleCellClick(cell));
            });
        });

        // Game control buttons
        document.getElementById('newGameBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('howToPlayBtn').addEventListener('click', () => this.showHowToPlay());

        // Mode selection buttons
        const humanVsHumanBtn = document.getElementById('humanVsHumanBtn');
        const humanVsComputerBtn = document.getElementById('humanVsComputerBtn');

        humanVsHumanBtn.addEventListener('click', () => {
            if (this.isComputerMode) {
                this.isComputerMode = false;
                humanVsHumanBtn.classList.add('active');
                humanVsComputerBtn.classList.remove('active');
                this.resetGame();
            }
        });

        humanVsComputerBtn.addEventListener('click', () => {
            if (!this.isComputerMode) {
                this.isComputerMode = true;
                humanVsComputerBtn.classList.add('active');
                humanVsHumanBtn.classList.remove('active');
                this.resetGame();
            }
        });

        // Modal close button
        const modal = document.getElementById('howToPlayModal');
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    showHowToPlay() {
        document.getElementById('howToPlayModal').style.display = 'block';
    }

    handleCellClick(cell) {
        if (this.gameOver) return;

        const piece = cell.firstChild;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // In computer mode, only allow red (human) player to move during their turn
        if (this.isComputerMode && this.currentPlayer === 'black') return;

        if (this.selectedPiece) {
            if (this.isValidMove(row, col)) {
                this.movePiece(row, col);
                this.clearValidMoves();
                this.selectedPiece = null;
                this.switchPlayer();
                
                // Computer's turn in computer mode
                if (this.isComputerMode && !this.gameOver && this.currentPlayer === 'black') {
                    setTimeout(() => this.makeComputerMove(), 500);
                }
            } else if (piece && piece.dataset.color === this.currentPlayer) {
                this.clearValidMoves();
                this.selectPiece(cell);
            } else {
                this.clearValidMoves();
                this.selectedPiece = null;
            }
        } else if (piece && piece.dataset.color === this.currentPlayer) {
            this.selectPiece(cell);
        }
    }

    selectPiece(cell) {
        this.selectedPiece = cell;
        this.validMoves = this.getValidMoves(cell);
        this.showValidMoves();
    }

    clearValidMoves() {
        this.board.forEach(row => {
            row.forEach(cell => {
                cell.classList.remove('valid-move');
            });
        });
    }

    showValidMoves() {
        this.validMoves.forEach(([row, col]) => {
            this.board[row][col].classList.add('valid-move');
        });
    }

    isValidMove(row, col) {
        return this.validMoves.some(([r, c]) => r === row && c === col);
    }

    movePiece(toRow, toCol) {
        const fromCell = this.selectedPiece;
        const toCell = this.board[toRow][toCol];
        
        if (toCell.firstChild) {
            const capturedPiece = toCell.firstChild;
            const capturedType = capturedPiece.dataset.type;
            const capturedColor = capturedPiece.dataset.color;
            
            // Create a copy of the captured piece for the captured pieces display
            const capturedPieceCopy = capturedPiece.cloneNode(true);
            capturedPieceCopy.classList.add('captured-piece');
            
            // Add to the appropriate captured pieces container
            if (capturedColor === 'black') {
                this.redCaptured.appendChild(capturedPieceCopy);
            } else {
                this.blackCaptured.appendChild(capturedPieceCopy);
            }
            
            toCell.removeChild(capturedPiece);
            
            if (capturedType === 'general') {
                this.gameOver = true;
                const winner = this.currentPlayer.toUpperCase();
                document.getElementById('status').textContent = 
                    `Game Over! ${winner} wins!`;
                
                // Show animated game over message
                const gameOverMessage = document.getElementById('gameOverMessage');
                gameOverMessage.textContent = `${winner} Wins! The ${capturedColor} General has been captured!`;
                gameOverMessage.style.display = 'block';
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    gameOverMessage.style.display = 'none';
                }, 5000);
                
                return;
            }
        }
        
        toCell.appendChild(fromCell.firstChild);
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        document.getElementById('status').textContent = 
            `${this.currentPlayer.toUpperCase()}'s Turn`;
    }

    getValidMoves(cell) {
        const piece = cell.firstChild;
        const type = piece.dataset.type;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const color = piece.dataset.color;
        const moves = [];

        switch (type) {
            case 'general':
                this.addGeneralMoves(row, col, color, moves);
                break;
            case 'advisor':
                this.addAdvisorMoves(row, col, color, moves);
                break;
            case 'elephant':
                this.addElephantMoves(row, col, color, moves);
                break;
            case 'horse':
                this.addHorseMoves(row, col, color, moves);
                break;
            case 'chariot':
                this.addChariotMoves(row, col, color, moves);
                break;
            case 'cannon':
                this.addCannonMoves(row, col, color, moves);
                break;
            case 'soldier':
                this.addSoldierMoves(row, col, color, moves);
                break;
        }

        return moves;
    }

    isInPalace(row, col, color) {
        if (color === 'red') {
            return row >= 7 && row <= 9 && col >= 3 && col <= 5;
        } else {
            return row >= 0 && row <= 2 && col >= 3 && col <= 5;
        }
    }

    addGeneralMoves(row, col, color, moves) {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (this.isInPalace(newRow, newCol, color)) {
                this.addMoveIfValid(newRow, newCol, color, moves);
            }
        }
    }

    addAdvisorMoves(row, col, color, moves) {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (this.isInPalace(newRow, newCol, color)) {
                this.addMoveIfValid(newRow, newCol, color, moves);
            }
        }
    }

    addElephantMoves(row, col, color, moves) {
        const directions = [[2, 2], [2, -2], [-2, 2], [-2, -2]];
        
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            const midRow = row + dx/2;
            const midCol = col + dy/2;
            
            if (this.isOnBoard(newRow, newCol) && 
                !this.board[midRow][midCol].firstChild &&
                ((color === 'red' && newRow >= 5) || 
                 (color === 'black' && newRow <= 4))) {
                this.addMoveIfValid(newRow, newCol, color, moves);
            }
        }
    }

    addHorseMoves(row, col, color, moves) {
        const directions = [
            [-2, -1], [-2, 1], [2, -1], [2, 1],
            [-1, -2], [1, -2], [-1, 2], [1, 2]
        ];
        
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (this.isOnBoard(newRow, newCol)) {
                const blockRow = row + Math.sign(dx);
                const blockCol = col + Math.sign(dy);
                
                if (!this.board[blockRow][blockCol].firstChild) {
                    this.addMoveIfValid(newRow, newCol, color, moves);
                }
            }
        }
    }

    addChariotMoves(row, col, color, moves) {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [dx, dy] of directions) {
            let newRow = row + dx;
            let newCol = col + dy;
            
            while (this.isOnBoard(newRow, newCol)) {
                if (this.board[newRow][newCol].firstChild) {
                    if (this.board[newRow][newCol].firstChild.dataset.color !== color) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
                moves.push([newRow, newCol]);
                newRow += dx;
                newCol += dy;
            }
        }
    }

    addCannonMoves(row, col, color, moves) {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [dx, dy] of directions) {
            let newRow = row + dx;
            let newCol = col + dy;
            let foundPlatform = false;
            
            while (this.isOnBoard(newRow, newCol)) {
                if (this.board[newRow][newCol].firstChild) {
                    if (!foundPlatform) {
                        foundPlatform = true;
                    } else {
                        if (this.board[newRow][newCol].firstChild.dataset.color !== color) {
                            moves.push([newRow, newCol]);
                        }
                        break;
                    }
                } else if (!foundPlatform) {
                    moves.push([newRow, newCol]);
                }
                newRow += dx;
                newCol += dy;
            }
        }
    }

    addSoldierMoves(row, col, color, moves) {
        const forward = color === 'red' ? -1 : 1;
        
        // Forward move
        this.addMoveIfValid(row + forward, col, color, moves);
        
        // Horizontal moves after crossing river
        if ((color === 'red' && row <= 4) || (color === 'black' && row >= 5)) {
            this.addMoveIfValid(row, col - 1, color, moves);
            this.addMoveIfValid(row, col + 1, color, moves);
        }
    }

    isOnBoard(row, col) {
        return row >= 0 && row < 10 && col >= 0 && col < 9;
    }

    addMoveIfValid(row, col, color, moves) {
        if (this.isOnBoard(row, col)) {
            const targetCell = this.board[row][col];
            if (!targetCell.firstChild || targetCell.firstChild.dataset.color !== color) {
                moves.push([row, col]);
            }
        }
    }

    makeComputerMove() {
        if (this.gameOver || this.currentPlayer !== 'black') return;

        // Get all possible moves and evaluate them
        const evaluatedMoves = [];
        this.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const piece = cell.firstChild;
                if (piece && piece.dataset.color === 'black') {
                    const moves = this.getValidMoves(cell);
                    moves.forEach(([toRow, toCol]) => {
                        const moveScore = this.evaluateMove(cell, this.board[toRow][toCol]);
                        evaluatedMoves.push({
                            from: cell,
                            to: this.board[toRow][toCol],
                            score: moveScore
                        });
                    });
                }
            });
        });

        if (evaluatedMoves.length > 0) {
            // Sort moves by score (highest first)
            evaluatedMoves.sort((a, b) => b.score - a.score);

            // Select one of the top moves (with some randomness)
            const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
            const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];

            this.selectedPiece = selectedMove.from;
            const toRow = parseInt(selectedMove.to.dataset.row);
            const toCol = parseInt(selectedMove.to.dataset.col);
            
            this.movePiece(toRow, toCol);
            this.selectedPiece = null;
            if (!this.gameOver) {
                this.switchPlayer();
            }
        }
    }

    evaluateMove(fromCell, toCell) {
        let score = 0;
        const piece = fromCell.firstChild;
        const pieceType = piece.dataset.type;
        const toRow = parseInt(toCell.dataset.row);
        const toCol = parseInt(toCell.dataset.col);
        const fromRow = parseInt(fromCell.dataset.row);
        const fromCol = parseInt(fromCell.dataset.col);

        // Base piece values
        const pieceValues = {
            general: 1000,
            advisor: 20,
            elephant: 20,
            horse: 40,
            chariot: 90,
            cannon: 45,
            soldier: 10
        };

        // Capturing score (if there's a piece to capture)
        if (toCell.firstChild) {
            const capturedType = toCell.firstChild.dataset.type;
            score += pieceValues[capturedType] * 1.5; // Prioritize capturing
            
            // Extra points for capturing with lower value pieces
            score += Math.max(0, pieceValues[capturedType] - pieceValues[pieceType]);
            
            // Huge bonus for capturing the general
            if (capturedType === 'general') {
                score += 5000;
            }
        }

        // Position-based scoring
        switch (pieceType) {
            case 'general':
                // Prefer staying in the palace
                if (this.isInPalace(toRow, toCol, 'black')) {
                    score += 10;
                }
                break;

            case 'advisor':
                // Advisors should stay in the palace
                if (this.isInPalace(toRow, toCol, 'black')) {
                    score += 15;
                }
                break;

            case 'elephant':
                // Elephants are more valuable in defensive positions
                if (toRow < 5) {
                    score += 10;
                }
                break;

            case 'horse':
                // Horses are more valuable in central positions
                if (toCol >= 2 && toCol <= 6) {
                    score += 5;
                }
                // Bonus for advancing
                score += (9 - toRow) * 0.5;
                break;

            case 'chariot':
                // Chariots are strong on open files
                let openFile = true;
                for (let row = 0; row < 10; row++) {
                    if (row !== fromRow && this.board[row][toCol].firstChild) {
                        openFile = false;
                        break;
                    }
                }
                if (openFile) score += 15;
                break;

            case 'cannon':
                // Cannons are better with some pieces to jump over
                let piecesInFile = 0;
                for (let row = 0; row < 10; row++) {
                    if (this.board[row][toCol].firstChild) piecesInFile++;
                }
                score += (piecesInFile - 2) * 5;
                break;

            case 'soldier':
                // Soldiers gain value as they advance
                score += (9 - toRow) * 2;
                // Extra points for crossing the river
                if (toRow < 5) score += 15;
                // Bonus for soldiers in the center files
                if (toCol >= 3 && toCol <= 5) score += 5;
                break;
        }

        // Defensive scoring
        if (this.isUnderThreat(fromCell)) {
            score += 30; // Prioritize moving threatened pieces
        }

        // Avoid moving into threatened squares
        if (this.isUnderThreat(toCell)) {
            score -= pieceValues[pieceType];
        }

        return score;
    }

    isUnderThreat(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Check if any red piece can capture this position
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                const checkCell = this.board[r][c];
                const piece = checkCell.firstChild;
                if (piece && piece.dataset.color === 'red') {
                    const moves = this.getValidMoves(checkCell);
                    if (moves.some(([moveRow, moveCol]) => moveRow === row && moveCol === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    resetGame() {
        // Clear the board
        this.board.forEach(row => {
            row.forEach(cell => {
                while (cell.firstChild) {
                    cell.removeChild(cell.firstChild);
                }
            });
        });

        // Clear captured pieces
        this.redCaptured.innerHTML = '';
        this.blackCaptured.innerHTML = '';

        // Hide game over message
        document.getElementById('gameOverMessage').style.display = 'none';

        // Reset game state
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        document.getElementById('status').textContent = "Red's Turn";

        // Setup new board
        this.setupBoard();
    }
}

// Initialize the game
const game = new ChineseChess(); 