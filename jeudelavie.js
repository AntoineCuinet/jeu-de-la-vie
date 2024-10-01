//_____________________________________________________________\\
//                                                             \\
//                       Le jeu de la vie                      \\
//              Script JavaScript (jeudelavie.js)              \\
//                                                             \\
//                    CUINET ANTOINE TP2B-CMI                  \\
//                             Web 4                           \\
//                        L3 Informatique                      \\
//                         UFC - UFR ST                        \\
//_____________________________________________________________\\
"use strict";

document.addEventListener("DOMContentLoaded", function(_e) {
    // Global variables
    const cvs = document.getElementById("cvs");
    const ctx = cvs.getContext("2d");
    const selResolution = document.getElementById("selResolution");
    const SIZE = 600;

    const btnNext = document.getElementById("btnNext");
    const btnStop = document.getElementById("btnStop");
    const btnPlay = document.getElementById("btnPlay");
    const btnReset = document.getElementById("btnReset");
    const btnClear = document.getElementById("btnClear");
    let interval = null;


    selResolution.addEventListener("change", function(e) {
        let newSize = Number(e.target.value);
        grid = new Grid(newSize);
        grid.render(ctx);
    });
    btnNext.addEventListener("click", function() {
        grid.next();
        grid.render(ctx);
    });
    btnClear.addEventListener("click", function() {
        const response = confirm('Effacer le canvas actuel et recommencer un nouveau ?');
        if(response) {
            grid = new Grid(Number(selResolution.value));
            grid.render(ctx);
        }
    });
    btnReset.addEventListener("click", function() {
        grid.restore();
        grid.render(ctx);
    });
    btnPlay.addEventListener("click", function() {
        btnNext.disabled = true;
        btnStop.disabled = false;
        btnPlay.disabled = true;
        btnReset.disabled = true;
        btnClear.disabled = true;

        interval = setInterval(function() {
            grid.next();
            grid.render(ctx);
        }, 100);
    });
    btnStop.addEventListener("click", function() {
        stopAnimation();
    });

    cvs.addEventListener("mousemove", function(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        grid.hover(x, y);
        grid.render(ctx);
    });
    cvs.addEventListener("mouseout", function() {
        grid.hover(-1, -1);
        grid.render(ctx);
    });
    cvs.addEventListener("click", function() {
        grid.click();
        grid.render(ctx);
        grid.save();
    });


    
    class Grid {
        constructor(size) {
            this.size = SIZE / size;
            this.grid = Array(size).fill(null).map(() => Array(size).fill(0)); // Initialize grid with 0
            this.over = {row: -1, col: -1};
            this.savedGrid = null;
        }

        hover(x,y) {
            let squareSize = this.size;
            this.over.row = Math.floor(y / squareSize);
            this.over.col = Math.floor(x / squareSize);
        }

        click() {
            const row = this.over.row;
            const col = this.over.col;
            this.grid[row][col] = this.grid[row][col] === 0 ? 1 : 0;
        }
        
        next() {
            let nextGrid = this.grid.map(row => [...row]); // Copy the current grid state with spread operator
            for(let row = 0; row < this.grid.length; row++) {
                for(let col = 0; col < this.grid[row].length; col++) {
                    const livingNeighbors = countNeighbors(row, col, this.grid, this.size);

                    if (this.grid[row][col] === 1) {
                        // Rule 1: A live cell with 2 or 3 neighbors stays alive, otherwise it dies
                        nextGrid[row][col] = (livingNeighbors === 2 || livingNeighbors === 3) ? 1 : 0;
                    } else {
                        // Rule 2: A dead cell with exactly 3 neighbors becomes alive
                        nextGrid[row][col] = (livingNeighbors === 3) ? 1 : 0;
                    }
                }
            }

            // Check if the current grid is equal to the next grid for stop the animation
            if (isGridsEqual(this.grid, nextGrid)) {
                stopAnimation();
            }

            // Copy the nextGrid state back to the current grid
            this.grid = nextGrid;
        }

        render(ctx) {
            ctx.clearRect(0, 0, SIZE, SIZE);

            if(this.over.row >= 0 && this.over.col >= 0) {
                ctx.fillStyle = "#A0A0A0";
                ctx.fillRect(this.over.col * this.size, this.over.row * this.size, this.size, this.size);
            }

            for(let row = 0; row < this.grid.length; ++row) {
                for(let col = 0; col < this.grid[row].length; ++col) {
                    if(this.grid[row][col] === 1) {
                        ctx.fillStyle = "black";
                        ctx.fillRect(col * this.size, row * this.size, this.size, this.size);
                    }
                }
            }
        }

        save() {
            this.savedGrid = this.grid.map(row => [...row]);
        }

        restore() {
            this.grid = this.savedGrid.map(row => [...row]);
        }
    }

    // Initialize a new grid
    let grid = new Grid(Number(selResolution.value));

    function countNeighbors(row, col, grid, size) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the cell itself
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
                    count += grid[newRow][newCol];
                }
            }
        }
        return count;
    }

    function isGridsEqual(grid1, grid2) {
        for (let row = 0; row < grid1.length; row++) {
            for (let col = 0; col < grid1[row].length; col++) {
                if (grid1[row][col] !== grid2[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    function stopAnimation() {
        btnNext.disabled = false;
        btnStop.disabled = true;
        btnPlay.disabled = false;
        btnReset.disabled = false;
        btnClear.disabled = false;

        clearInterval(interval);
    }
});