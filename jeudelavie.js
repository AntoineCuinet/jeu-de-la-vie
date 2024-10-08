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
    let oldSize = selResolution.value;
    const SIZE = 600;

    const btnNext = document.getElementById("btnNext");
    const btnStop = document.getElementById("btnStop");
    const btnPlay = document.getElementById("btnPlay");
    const btnReset = document.getElementById("btnReset");
    const btnClear = document.getElementById("btnClear");
    let interval = null;

    const colorBase = document.getElementById('colorBase');
    const colorNew = document.getElementById('colorNew');
    const colorDying = document.getElementById('colorDying');
    const cbNew = document.getElementById('cbNew');
    const cbDying = document.getElementById('cbDying');

    const speeds = document.getElementsByName('radSpeed');
    let actualSpeed = 500;

    // Load the form data from the local storage
    loadFormData();

    selResolution.addEventListener("change", function(e) {
        const response = confirm('Effacer le canvas actuel et recommencer un nouveau ?');
        if(response) {
            grid = null;
            let newSize = Number(e.target.value);
            grid = new Grid(newSize);
            grid.render(ctx);
            oldSize = newSize;

            saveFormData();
        } else {
            document.querySelector(`#selResolution option[value="${oldSize}"]`).selected = true;
        }
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

        // Function to start the interval
        const startInterval = () => {
            clearInterval(interval); // Clear the previous interval
            interval = setInterval(function() {
                grid.next();
                grid.render(ctx);
            }, actualSpeed);
        };

        // Add event listeners to each radio button
        for (const speed of speeds) {
            speed.addEventListener('change', function() {
                if (this.checked) {
                    actualSpeed = this.value;
                    startInterval(); // Restart the interval with the new speed
                    saveFormData();
                }
            });
        }

        // Start the interval for the first time
        startInterval();
    });
    btnStop.addEventListener("click", function() {
        stopAnimation();
    });

    colorBase.addEventListener('input', function() {
        grid.render(ctx);
        saveFormData();
    });
    colorNew.addEventListener('input', function() {
        grid.render(ctx);
        saveFormData();
    });
    colorDying.addEventListener('input', function() {
        grid.render(ctx);
        saveFormData();
    });
    cbNew.addEventListener('change', function() {
        grid.render(ctx);
        saveFormData();
    });
    cbDying.addEventListener('change', function() {
        grid.render(ctx);
        saveFormData();
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
            this.previousGrid = Array(size).fill(null).map(() => Array(size).fill(0));
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
            for(let row = 0; row < this.grid.length; ++row) {
                for(let col = 0; col < this.grid[row].length; ++col) {
                    const livingNeighbors = countNeighbors(row, col, this.grid);

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

            this.previousGrid = this.grid.map(row => [...row]);
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
                    const livingNeighbors = countNeighbors(row, col, this.grid);
                    const previousCell = this.previousGrid[row][col];

                    if(this.grid[row][col] === 1) {
                        if (previousCell === 0 && cbNew.checked) { // Prioritize new cells
                            ctx.fillStyle = colorNew.value;
                        } else if ((livingNeighbors !== 2 && livingNeighbors !== 3) && cbDying.checked) {
                            ctx.fillStyle = colorDying.value;
                        } else {
                            ctx.fillStyle = colorBase.value;
                        }

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
            this.previousGrid = this.savedGrid.map(row => [...row]);
        }
    }

    // Initialize a new grid
    let grid = new Grid(Number(selResolution.value));

    function countNeighbors(row, col, grid) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the cell itself
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
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


    function loadFormData() {
        const savedData = JSON.parse(localStorage.getItem("formData"));

        if (savedData) {
            // Apply the resolution
            selResolution.value = savedData.resolution;

            // Apply the speed
            for (const speed of speeds) {
                if (speed.value === savedData.speed) {
                    speed.checked = true;
                    break;
                }
            }
            actualSpeed = savedData.speed;
            
            // Apply the colors
            colorBase.value = savedData.color;
            colorNew.value = savedData.colorNew;
            colorDying.value = savedData.colorDying;
            cbNew.checked = savedData.cbNew;
            cbDying.checked = savedData.cbDying;
        }
    }

    function saveFormData() {
        const formData = {
            resolution: selResolution.value,
            speed: actualSpeed,
            color: colorBase.value,
            colorNew: colorNew.value,
            cbNew: cbNew.checked,
            colorDying: colorDying.value,
            cbDying: cbDying.checked
        };
        localStorage.setItem("formData", JSON.stringify(formData));
    }
});