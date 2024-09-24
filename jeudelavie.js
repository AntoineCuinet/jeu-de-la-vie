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

    selResolution.addEventListener("change", function(e) {
        let newSize = Number(e.target.value);
        grid = new Grid(newSize);
        grid.render(ctx);
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
            // permet de traiter le survol par la souris d'un point de coordonnées x, y sur la grille
            let squareSize = this.size;
            this.over.row = Math.floor(y / squareSize);
            this.over.col = Math.floor(x / squareSize);

        }

        click() {
            // permet de traiter un clic de la souris sur la grille
            const row = this.over.row;
            const col = this.over.col;
            this.grid[row][col] = this.grid[row][col] === 0 ? 1 : 0;
        }
        
        next() {
            // permet de calculer l'état suivant de la grille
        }

        render(ctx) {
            // permet de dessiner l'état courant de la grille sur le contexte de dessin (ctx de type 2DContext) passé en paramètre
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

    // Initialisation de la grille
    let grid = new Grid(Number(selResolution.value));
});