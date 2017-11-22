// This file contains the snake game.

// region document control

// Contains code for the document control

function refreshPage(){
    location.reload();
}



// endregion

// region snake engine
function Part(x, y, col) {
    this.x = x;
    this.y = y;
    this.col = col;

}


function Snake(game, x, y, length, colour) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.xspeed = 1;
    this.yspeed = 0;
    this.canChange = true;

    var _this = this;
    this.parts = []; // Container for our snake.

    this.makeSnake = function (x, y, length, colour) {
        if (colour == "rainbow") {
            // Handle rainbow scheme.
        } else {
            for (var i = 0; i < length; i++) {
                _this.parts.push(new Part(x - i, y, colour))
            }
        }
    };

    this.makeSnake(x, y, length, colour);

    // Event key controller
    this.controller = function (key) {
        // left
        if (key == 37 && this.yspeed != 0 && this.canChange) {
            this.canChange = false;
            this.xspeed = -1;
            this.yspeed = 0;
        }
        // Right
        if (key == 39 && this.yspeed != 0 && this.canChange) {
            this.canChange = false;
            this.xspeed = 1;
            this.yspeed = 0;
        }
        // Up
        if (key == 38 && this.xspeed != 0 && this.canChange) {
            this.canChange = false;
            this.xspeed = 0;
            this.yspeed = -1;
        }
        // Down
        if (key == 40 && this.xspeed != 0 && this.canChange) {
            this.canChange = false;
            this.xspeed = 0;
            this.yspeed = 1;
        }
    };

    // Adding a piece to the snake.
    this.addPart = function () {
        var lastPart = this.parts[this.parts.length - 1]; // Get the last element.
        this.parts.push(new Part(lastPart.x, lastPart.y)); // Add a new part.
    };

    // Handling death
    this.die = function () {
        this.parts = []; // Just empty all the parts.
    };


    // Handling the keypress events.
    document.onkeydown = function (e) {
        _this.controller(e.which);
    };

    // Update the snake.
    this.update = function () {
        this.x += this.xspeed;
        this.y += this.yspeed;

        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > this.game.w - 1) this.x = this.game.w - 1;
        if (this.y > this.game.h - 1) this.y = this.game.h - 1;

        for (var i = this.parts.length - 1; i >= 0; i--) {
            var part = this.parts[i];

            if (i != 0) { // Move the parts
                part.x = this.parts[i - 1].x;
                part.y = this.parts[i - 1].y;

                if (this.x == part.x && this.y == part.y) { // if we collide with ourselves, die.
                    this.die();
                }
            } else {
                part.x = this.x;
                part.y = this.y;
            }
            this.game.grid.fillGrid(part.x, part.y, part.col);
        }
        this.canChange = true;
    };

}

function Food(game) {
    this.game = game;
    this.foodCol = "black"; // Accessed directly in the setter.

    this.placeFood = function () {
        this.x = Math.floor(Math.random() * this.game.w);
        this.y = Math.floor(Math.random() * this.game.h);
    };

    this.update = function () {
        this.game.grid.fillGrid(this.x, this.y, this.foodCol);
    };

    this.placeFood();
}


function RenderGrid(game, border) {

    this.game = game; // This variable holds the game, we need this to correctly send back where to draw the grid.
    this.grid = []; // This keeps a track of where all the grids are.


    // Set the default for grid borders.
    border = typeof border !== 'undefined' ? border : 'none';

    // Draws the border of the stage.
    this.drawBorder = function (x, y, height, width, node) {

        if (x == 0) {
            node.style.borderLeft = "solid";
        }
        if (y == 0) {
            node.style.borderTop = "solid";
        }
        if (x == width - 1) {
            node.style.borderRight = "solid";
        }
        if (y == height - 1) {
            node.style.borderBottom = "solid";
        }

    };

    // Function to build the grid to run snake on
    this.buildGrid = function () {
        for (var x = 0; x < this.game.w; x++) { // Go across the x axis
            this.grid[x] = []; // Build container for y-axis as we go across the x axis.
            for (var y = 0; y < this.game.h; y++) {
                var node = document.createElement("div"); // Create a div (sprite) for each of the grid elements.
                node.style.position = "absolute";
                node.style.width = node.style.height = this.game.gs + "px"; // Make the size of the div the grid size.

                // Arrange the divs.
                node.style.left = x * this.game.gs + "px";
                node.style.top = y * this.game.gs + "px";

                // Set the border. TODO: Review this.
                this.drawBorder(x, y, this.game.h, this.game.w, node);


                // Append the sprite to the stage (default sprite colour is gray)
                this.game.stage.appendChild(node);
                this.grid[x][y] = {
                    node: node,
                    val: false,
                    col: "gray"
                }
            }
        }
    };

    // Fills the grid wit ha given colour.
    this.fillGrid = function (x, y, col) {
        if (this.grid[x]) {
            if (this.grid[x][y]) {
                this.grid[x][y].val = true;
                this.grid[x][y].col = col;
            }
        }
    };

    // Update the grid colour.
    this.update = function () {
        for (var x = 0; x < this.game.w; x++) {
            for (var y = 0; y < this.game.h; y++) {
                var gridElement = this.grid[x][y];

                if (gridElement.val) {
                    gridElement.node.style.background = gridElement.col;
                } else {
                    gridElement.node.style.background = "white";
                }
                gridElement.val = false;
            }
        }
    };


    // Actually build the grid.
    this.buildGrid();
}


// This function holds the game. Handles things like height of the game, width of the game, grid size and how fast the snake moves.
function Game(height, width, gridSize, speed) {
    this.h = height; // How high your game is.
    this.w = width; // How Wide your game is.
    this.gs = gridSize; // Size of the grid (size of the snake and the food).
    this.spd = speed; // How fast you want your snake to move.

    // This part just gets the "sprites".
    this.stage = document.getElementById("stage"); // This is the sprite which shows the score.
    this.score = document.getElementById("score"); // This is teh sprite that shows your score.

    this.curr_score = 0; // Keep track of the current score.

    this.grid = new RenderGrid(this); // Generate the grid for snake to move around in.
    this.food = new Food(this); // Generate food.
    this.snake = new Snake(this, 5, 2, 3, "green"); // Generate a snake.

    // Reference the function instance. Don't worry too much about this, but it's to set how fast your snake moves.
    var _this = this;

    // Converts the speed into a a fraction for the update rate.
    this.updateSpeed = function () {
        return 1000 * (1 / this.spd);
    };

    //Start loop
    this.interval = setInterval(function () {
        _this.update();
    }, this.updateSpeed());

    // This function updates each frame of the game.
    this.update = function () {
        this.score.innerHTML = this.curr_score; // Set the score.
        this.food.update(); // Update the food.
        this.snake.update(); // Update the snake.
        if (this.snake.x == this.food.x && this.snake.y == this.food.y) {
            this.food.placeFood();
            this.snake.addPart();
            this.curr_score++;
        }
        this.grid.update(); // Update the grid.
    };

    // Assigning the food colour.
    this.foodColour = function (colour) {
        this.food.foodCol = colour;
    }
}

// endregion

// region Main()

/*
START YOUR CODE HERE
 */
var snakeGame = new Game(25, 25, 25, 15);
snakeGame.foodColour("orange");


// endregion