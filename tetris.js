var BLOCK_SIZE = 32;

var grid        = []; // any value other than -1 is non-empty
var GRID_WIDTH  = 10;
var GRID_HEIGHT = 20;

var X_START        = 3;
var Y_START        = 0;
var N_BLOCK_COLORS = 7;
var N_BLOCK_TYPES  = 7;

// game states
var STATE = {
    START:  0,
    PLAY:   1,
    SCORE:  2,
    FINISH: 3
};

var gameState           = STATE.START;
var score               = 0;
var scoringTimer        = 0;
var SCORING_FRAMES      = 10;
var SCORE_XPOS          = BLOCK_SIZE;
var SCORE_YPOS          = BLOCK_SIZE;
var MIN_FRAMES_PER_STEP = 10;
var framesPerStep       = 60;
var MAX_PER_STEP_TIMER  = 300;
var framesPerStepTimer  = MAX_PER_STEP_TIMER;

var blockBag             = [];
var colorBag             = [];
var playerBlock;
var playerShiftState     = [0, 0];
var PLAYER_SHIFT_FRAMES  = 2;
var PLAYER_BLOCK_SIZE    = 4;
var SCORING_TABLE        = [0, 100, 250, 400, 1000];

function setup() {
    createCanvas(BLOCK_SIZE * GRID_WIDTH, BLOCK_SIZE * GRID_HEIGHT);

    // initialize the grid
    for (var i = 0; i < GRID_WIDTH; i++) {
        grid.push([]);
        for (var j = 0; j < GRID_HEIGHT; j++) {
            grid[i].push(-1);
        }
    }

    // fill up the block bag
    for (var i = 0; i < N_BLOCK_TYPES; i++)
        blockBag.push(i);
    
    // create the player block
    playerBlock = new PlayerBlock();

    // start the game
    gameState = STATE.PLAY;
}

function draw() {
    background(0);

    if (--framesPerStepTimer == 0) {
        framesPerStepTimer = MAX_PER_STEP_TIMER;
        if (framesPerStep > MIN_FRAMES_PER_STEP)
            framesPerStep--;
    }

    // draw the grid
    for (var i = 0; i < GRID_WIDTH; i++) {
        for (var j = 0; j < GRID_HEIGHT; j++) {
            if (grid[i][j] != -1) {
                if (grid[i][j] == N_BLOCK_COLORS)
                    noStroke();
                else 
                    stroke(0);
                fill(BLOCK_COLORS[grid[i][j]]);
                rect(BLOCK_SIZE * i, BLOCK_SIZE * j, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    // game running 
    if (gameState == STATE.PLAY) {
        // player block
        playerBlock.step();
    } else if (gameState == STATE.SCORE) {
        if (--scoringTimer == 0) {
            // delete all line clears on the grid, shift remaining rows down
            var distToFloor = 0;
            for (var j = GRID_HEIGHT-1; j >= 0; j--) {
                for (var i = 0; i < GRID_WIDTH; i++) {
                    if (grid[i][j] == N_BLOCK_COLORS) { // this row is a line clear
                        for (var ii = 0; ii < GRID_WIDTH; ii++)
                            grid[ii][j] = -1;
                        distToFloor++;
                        break;
                    } else if (grid[i][j] == -1) { // this row is empty
                        if (i == GRID_WIDTH-1) {
                            distToFloor++;
                            break;
                        }
                    } else { // this row is non-empty
                        if (distToFloor > 0) {
                            for (var ii = 0; ii < GRID_WIDTH; ii++) {
                                grid[ii][j+distToFloor] = grid[ii][j];
                                grid[ii][j] = -1;
                            } 

                            j += distToFloor; 
                            distToFloor = 0;
                            break;
                        } else  
                            break;
                    }
                }
            }

            gameState = STATE.PLAY;
        }
    } else if (gameState == STATE.FINISH) {
        fill(0, 150);
        rect(0, 0, BLOCK_SIZE * GRID_WIDTH, BLOCK_SIZE * GRID_HEIGHT);
    }

    // draw the HUD
    textFont("Consolas");
    fill(255);
    noStroke();
    textSize(20);
    text("Score: ", SCORE_XPOS, SCORE_YPOS);
    text(score, SCORE_XPOS + 75, SCORE_YPOS);
}

function keyPressed() {
    // rotation
    if (keyCode == 32) {
        playerBlock.rotate();
    }
    
    // shifting 
    if (keyCode == 37) {
        playerShiftState = [-1, 0];
    } else if (keyCode == 39) {
        playerShiftState = [1, 0];
    } else if (keyCode == 40) {
        playerShiftState = [0, 1];
    }
}

function keyReleased() {
    if (keyCode != 32) // 32 is spacebar, which is for rotation
        playerShiftState = [0, 0];
}

class PlayerBlock {
    constructor() {
        this.xpos  = X_START;
        this.ypos  = Y_START;

        // initialize timers
        this.downShiftTimer   = framesPerStep;
        this.playerShiftTimer = PLAYER_SHIFT_FRAMES;

        this.blockTypeIndex     = this.getFromBlockBag();
        this.blockColorIndex    = this.getFromColorBag();
        this.blockRotationIndex = 0;
        
        // initialize player block pairs
        this.initializePairs();

        // check if new player block just triggered game over
        if (!this.checkFree(0, 0)) {
            gameState = STATE.FINISH;
        }
    }

    step() {
        // shift if key held down
        if (playerShiftState != [0, 0]) {
            if (--this.playerShiftTimer == 0) {
                this.playerShiftTimer = PLAYER_SHIFT_FRAMES;
                this.shift(playerShiftState[0], playerShiftState[1]);
            }
        }

        // timer check
        if (--this.downShiftTimer == 0) {
            this.downShiftTimer = framesPerStep;

            if (playerShiftState != [0, 1])
                this.shift(0, 1);
        }

        // draw the player block
        stroke(0);
        fill(BLOCK_COLORS[this.blockColorIndex]);
        for (var i = 0; i < this.pairs.length; i++) {
            rect(BLOCK_SIZE * this.pairs[i].x, BLOCK_SIZE * this.pairs[i].y, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    checkFree(xdiff, ydiff) {
        for (var i = 0; i < this.pairs.length; i++) {
            var xnew = this.pairs[i].x + xdiff;
            var ynew = this.pairs[i].y + ydiff;

            // check the bounds of the player block
            if (xnew < 0 || xnew >= GRID_WIDTH ||
                ynew < 0 || ynew >= GRID_HEIGHT)
                return false;

            // check the grid for dead blocks
            if (grid[xnew][ynew] != -1)
                return false;
        }

        return true;
    }

    checkRotationFree() {
        var checkPairs = [];
        var checkRotationIndex = (this.blockRotationIndex + 1) % BLOCK_TYPES[this.blockTypeIndex].length;

        for (var i = 0; i < BLOCK_TYPES[this.blockTypeIndex][checkRotationIndex].length; i++) {
            checkPairs.push({x: this.xpos + BLOCK_TYPES[this.blockTypeIndex][checkRotationIndex][i].x, 
                             y: this.ypos + BLOCK_TYPES[this.blockTypeIndex][checkRotationIndex][i].y});

            if (grid[checkPairs[i].x][checkPairs[i].y] != -1)
                return false;
        }

        return true;
    }

    initializePairs() {
        this.pairs = [];

        for (var i = 0; i < BLOCK_TYPES[this.blockTypeIndex][this.blockRotationIndex].length; i++) 
            this.pairs.push({x: this.xpos + BLOCK_TYPES[this.blockTypeIndex][this.blockRotationIndex][i].x, 
                             y: this.ypos + BLOCK_TYPES[this.blockTypeIndex][this.blockRotationIndex][i].y});
    }

    getFromBlockBag() {
        if (blockBag.length == 0) {
            for (var i = 0; i < N_BLOCK_TYPES; i++)
                blockBag.push(i);
        }

        var indexToSplice = Math.floor(blockBag.length * Math.random());
        var newBlockType = blockBag[indexToSplice];
        blockBag.splice(indexToSplice, 1);

        return newBlockType;
    }

    getFromColorBag() {
        if (colorBag.length == 0) {
            for (var i = 0; i < N_BLOCK_COLORS; i++)
                colorBag.push(i);
        }

        var indexToSplice = Math.floor(colorBag.length * Math.random());
        var newBlockColor = colorBag[indexToSplice];
        colorBag.splice(indexToSplice, 1);

        return newBlockColor;
    }


    rotate() {
        if (this.checkRotationFree()) {
            this.blockRotationIndex = (this.blockRotationIndex + 1) % BLOCK_TYPES[this.blockTypeIndex].length;
            this.initializePairs();
        }
    }

    shift(xdiff, ydiff) {
        if (this.checkFree(xdiff, ydiff)) {
            // shift downward
            if (xdiff == 0 && ydiff == 1) {                           
                this.ypos++;
                score++;

                if (framesPerStep == MIN_FRAMES_PER_STEP)
                    score++;

                for (var i = 0; i < this.pairs.length; i++)
                    this.pairs[i].y++;

            // shift left or right
            } else if ((xdiff == -1 || xdiff == 1) && ydiff == 0) {    
                this.xpos += xdiff;

                for (var i = 0; i < this.pairs.length; i++)
                    this.pairs[i].x += xdiff;
            }
        } else {
            if (ydiff == 1) {
                // current player block is now dead, dump it into the grid
                for (var i = 0; i < this.pairs.length; i++) {
                    grid[this.pairs[i].x][this.pairs[i].y] = this.blockColorIndex;
                }

                // check if player just scored
                var nLineClears = 0;
                for (var j = GRID_HEIGHT-1; j >= 0; j--) {
                    for (var i = 0; i < GRID_WIDTH; i++) {
                        if (grid[i][j] == -1)
                            break;
                        
                        if (i == GRID_WIDTH-1) { // oh baby, a line clear!
                            nLineClears++;
                            gameState = STATE.SCORE;

                            for (var ii = 0; ii < GRID_WIDTH; ii++)
                                grid[ii][j] = N_BLOCK_COLORS;
                        }
                    }
                } score += SCORING_TABLE[nLineClears];

                if (framesPerStep == MIN_FRAMES_PER_STEP)
                    score += SCORING_TABLE[nLineClears];

                if (nLineClears > 0)
                    scoringTimer = nLineClears * SCORING_FRAMES;

                // create and set new player block
                playerBlock = new PlayerBlock();
            }
        }
    }
}