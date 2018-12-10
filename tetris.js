var VERSION_STRING = "v0.2.0";

var BLOCK_SIZE = 32;

var grid        = []; // any value other than -1 is non-empty
var GRID_WIDTH  = 10;
var GRID_HEIGHT = 20;

var X_START        = 3;
var Y_START        = 0;
var N_BLOCK_COLORS = 7;
var N_BLOCK_TYPES  = 7;

// key controls mapping
var KEY = {
    LEFT:   37,
    RIGHT:  39,
    DOWN:   40,
    ROTATE: 38,
    SPACE:  32 
};

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
var MAX_PER_STEP_TIMER  = 360;
var framesPerStepTimer  = MAX_PER_STEP_TIMER;

var blockBag;
var preview;
var PREVIEW_SIZE   = 2;
var PREVIEW_OFFSET = 1;

var playerBlock;
var playerShiftState     = [0, 0];
var PLAYER_SHIFT_FRAMES  = 2;
var PLAYER_BLOCK_SIZE    = 4;
var SCORING_TABLE        = [0, 100, 250, 400, 1000];

var gameFont;
var gameMusic;
var gameStarted = false;
var scoreSounds = [];
var miscSounds = {};

var DROP_SOUND_FILE = "assets/click.wav";

var SCORE_SOUND_FILES = [
    "assets/Rise01.mp3",
    "assets/Rise02.mp3",
    "assets/Rise03.mp3",
    "assets/FX141.wav",
];  

function preload() {
    // load assets
    gameFont = loadFont("assets/uni0553-webfont.ttf");
    gameMusic = loadSound("assets/Twister Tetris.mp3");

    for (var i = 0; i < SCORE_SOUND_FILES.length; i++) {
        scoreSounds.push(loadSound(SCORE_SOUND_FILES[i]));
    }

    miscSounds["DROP"] = loadSound(DROP_SOUND_FILE);
}

function setup() {
    createCanvas(BLOCK_SIZE * GRID_WIDTH, BLOCK_SIZE * GRID_HEIGHT);

    // initialize the grid
    for (var i = 0; i < GRID_WIDTH; i++) {
        grid.push([]);
        for (var j = 0; j < GRID_HEIGHT; j++) {
            grid[i].push(-1);
        }
    }

    // create and fill the block bag
    blockBag = new BlockBag();

    // create the preview window
    preview = new Preview();
    
    // create the player block
    playerBlock = new PlayerBlock();
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
                stroke(0);
                fill(BLOCK_COLORS[grid[i][j]]);
                rect(BLOCK_SIZE * i, BLOCK_SIZE * j, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    // draw the start screen
    if (gameState == STATE.START) {
        textFont(gameFont);
        noStroke();
        textSize(30);

        for (var i = 0; i < BLOCK_COLORS.length; i++) {
            fill(BLOCK_COLORS[i]);
            text("TETRIS", SCORE_XPOS, SCORE_YPOS + BLOCK_SIZE*.5*i);

            if (i == BLOCK_COLORS.length-1) {
                textSize(15);
                text(VERSION_STRING, SCORE_XPOS + 4*BLOCK_SIZE, SCORE_YPOS + BLOCK_SIZE*.5*i);
            }
        }

        textSize(20);
        text("Press any button to play.", SCORE_XPOS, (SCORE_YPOS + BLOCK_SIZE * (GRID_HEIGHT-1))/2);

        textSize(20);
        text("Ian K. Lee", BLOCK_SIZE/2, BLOCK_SIZE * (GRID_HEIGHT-.5));
    }

    // game running 
    if (gameState == STATE.PLAY) {
        // player block
        playerBlock.step();
        preview.step();
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

        if (gameStarted) {
            gameStarted = false;
            gameMusic.stop();
        }
    }

    // draw the score screen
    if (gameState != STATE.START) {
        textFont(gameFont);
        fill(255);
        noStroke();
        textSize(20);
        text("Score: ", SCORE_XPOS, SCORE_YPOS);
        text(score, SCORE_XPOS + 75, SCORE_YPOS);
    }
}

function startTheGame() {
    if (gameState == STATE.START) {
        gameState = STATE.PLAY;
        gameStarted = true;
        gameMusic.setVolume(0.1);
        gameMusic.play();
    }
}

function keyPressed() {
    if (gameState == STATE.START) {
        startTheGame();
        return;
    }

    if (gameState == STATE.FINISH) {
        return;
    }

    // rotation
    if (keyCode == KEY.ROTATE) {
        playerBlock.rotate();
    }
    
    // shifting 
    if (keyCode == KEY.LEFT) {
        playerBlock.shift(-1, 0);
    } else if (keyCode == KEY.RIGHT) {
        playerBlock.shift(1, 0);
    } else if (keyCode == KEY.DOWN) {
        playerShiftState = [0, 1];
    }

    // dropping
    if (keyCode == KEY.SPACE) {
        playerBlock.drop();
    }
}

function mousePressed() {
    if (gameState == STATE.START) {
        startTheGame();
    }
}

function keyReleased() {
    if (keyCode != KEY.ROTATE)
        playerShiftState = [0, 0];
}

class PlayerBlock {
    constructor() {
        this.xpos = X_START;
        this.ypos = Y_START;

        // initialize timers
        this.downShiftTimer   = framesPerStep;
        this.playerShiftTimer = PLAYER_SHIFT_FRAMES;

        var blockInfo = blockBag.getNextBlockInfo();
        this.blockTypeIndex = blockInfo.blockType;
        this.blockColorIndex = blockInfo.blockColor;

        this.blockRotationIndex = 0;
        
        // initialize player block pairs
        this.initializePairs();

        // initialize ghost block info
        this.ghostYDiff = 0;

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

        // calculate and draw the ghost block
        this.ghostYDiff = 0;
        while (this.checkFree(0, this.ghostYDiff+1)) {
            this.ghostYDiff++;
        }

        stroke(255);
        var ghostBlockColors = [];
        for (var i = 0; i < BLOCK_COLORS[this.blockColorIndex].length; i++) {
            var col = BLOCK_COLORS[this.blockColorIndex][i];
            col /= 4;
            ghostBlockColors.push(col);
        }
        fill(ghostBlockColors);
        for (var i = 0; i < this.pairs.length; i++) {
            rect(BLOCK_SIZE * this.pairs[i].x, BLOCK_SIZE * (this.pairs[i].y + this.ghostYDiff), BLOCK_SIZE, BLOCK_SIZE);
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

            if (checkPairs[i].x < 0 || checkPairs[i].x >= GRID_WIDTH ||
                checkPairs[i].y < 0 || checkPairs[i].y >= GRID_HEIGHT)
                return false;

            if (grid[checkPairs[i].x][checkPairs[i].y] != -1)
                return false;
        }

        return true;
    }

    drop() {
        miscSounds["DROP"].play();

        this.ypos += this.ghostYDiff;
        for (var i = 0; i < this.pairs.length; i++) {
            this.pairs[i].y += this.ghostYDiff;
        }

        // shift down immediately afterwards to quickly reset player block
        score += this.ghostYDiff; 
        this.shift(0, 1);
    }

    initializePairs() {
        this.pairs = [];

        for (var i = 0; i < BLOCK_TYPES[this.blockTypeIndex][this.blockRotationIndex].length; i++) 
            this.pairs.push({x: this.xpos + BLOCK_TYPES[this.blockTypeIndex][this.blockRotationIndex][i].x, 
                             y: this.ypos + BLOCK_TYPES[this.blockTypeIndex][this.blockRotationIndex][i].y});
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

                if (nLineClears > 0) {
                    scoreSounds[nLineClears-1].play();
                    scoringTimer = nLineClears * SCORING_FRAMES;
                }

                // create and set new player block
                playerBlock = new PlayerBlock();
            }
        }
    }
};

class BlockBag {
    constructor() {
        this.blockBag = [];
        this.colorBag = [];

        this.nextBlockBagIndex = -1;
        this.nextColorBagIndex = -1;
        this.determineNextBlock();
    }

    determineNextBlock() {
        if (this.blockBag.length == 0) {
            for (var i = 0; i < N_BLOCK_TYPES; i++)
                this.blockBag.push(i);
        }

        if (this.colorBag.length == 0) {
            for (var i = 0; i < N_BLOCK_COLORS; i++)
                this.colorBag.push(i);
        }

        this.nextBlockBagIndex  = Math.floor(this.blockBag.length * Math.random());
        this.nextColorBagIndex  = Math.floor(this.colorBag.length * Math.random());
    }

    getNextBlockInfo() {
        var res = { 
            blockType:  this.blockBag[this.nextBlockBagIndex], 
            blockColor: this.colorBag[this.nextColorBagIndex] 
        };

        this.blockBag.splice(this.nextBlockBagIndex, 1);
        this.colorBag.splice(this.nextColorBagIndex, 1);

        this.determineNextBlock();
        return res;
    }
};

class Preview {
    step() {
        // draw the next block
        fill(BLOCK_COLORS[blockBag.colorBag[blockBag.nextColorBagIndex]]);
        stroke(0);
        for (var i = 0; i < BLOCK_TYPES[blockBag.blockBag[blockBag.nextBlockBagIndex]][0].length; i++) {
            var DRAW_X = BLOCK_SIZE * (GRID_WIDTH-2) + BLOCK_SIZE/4 * PREVIEW_SIZE * 
                         BLOCK_TYPES[blockBag.blockBag[blockBag.nextBlockBagIndex]][0][i].x;
            var DRAW_Y = BLOCK_SIZE/4 * PREVIEW_SIZE * BLOCK_TYPES[blockBag.blockBag[blockBag.nextBlockBagIndex]][0][i].y;

            rect(DRAW_X-PREVIEW_OFFSET-1, DRAW_Y+PREVIEW_OFFSET, BLOCK_SIZE/PREVIEW_SIZE, BLOCK_SIZE/PREVIEW_SIZE);
        }

        // draw the preview frame
        stroke(255);
        noFill();
        rect(BLOCK_SIZE * (GRID_WIDTH-PREVIEW_SIZE) - PREVIEW_OFFSET-1, PREVIEW_OFFSET, 2*BLOCK_SIZE, 2*BLOCK_SIZE); 
    }
};