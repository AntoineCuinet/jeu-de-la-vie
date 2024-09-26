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
    });


    
    class Grid {
        constructor(size) {
            this.size = SIZE / size;
            this.grid = Array(size).fill(null).map(() => Array(size).fill(0)); // Initialize grid with 0
            this.over = {row: -1, col: -1};
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
            let nextGrid = Array(this.grid.length).fill(null).map(() => Array(this.grid[0].length).fill(0));
            for(let row = 0; row < this.grid.length; ++row) {
                for(let col = 0; col < this.grid[row].length; ++col) {
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

            // Copy the nextGrid state back to the current grid
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    this.grid[row][col] = nextGrid[row][col];
                }
            }
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
            // permet d'enregistrer l'état actuel de la grille
        }

        restore() {
            // permet de restaurer l'état de la grille précédemment sauvegardé
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
});