
var BLOCK_COLORS = [
    // standard block colors
    [192, 0, 0],
    [0, 192, 0],
    [0, 0, 192],
    [255, 128, 0],
    [192, 0, 192],
    [0, 192, 192],
    [255, 255, 0],

    // reserved for scoring only
    [255, 255, 255]
];

var BLOCK_TYPES = [
    // line type
    [
        // line rotations
        [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}],
        [{x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}, {x: 2, y: 3}]
    ],

    // left-L type
    [
        // left-L rotations
        [{x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}],
        [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 2, y: 1}],
        [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}],
        [{x: 1, y: 2}, {x: 2, y: 2}, {x: 2, y: 1}, {x: 2, y: 0}]
    ],

    // right-L type
    [
        // right-L rotations
        [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 3, y: 1}],
        [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 2, y: 3}],
        [{x: 0, y: 2}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}],
        [{x: 1, y: 0}, {x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}]
    ],

    // square type
    [
        // square rotations
        [{x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 1}, {x: 2, y: 2}]
    ],

    // left-skew type
    [
        // left-skew rotations
        [{x: 0, y: 2}, {x: 1, y: 2}, {x: 1, y: 1}, {x: 2, y: 1}],
        [{x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}],
        [{x: 1, y: 2}, {x: 2, y: 2}, {x: 2, y: 1}, {x: 3, y: 1}],
        [{x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 2, y: 3}]
    ],

    // right-skew type
    [
        // right-skew rotations
        [{x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}, {x: 3, y: 2}],
        [{x: 1, y: 2}, {x: 1, y: 3}, {x: 2, y: 1}, {x: 2, y: 2}],
        [{x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}],
        [{x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 0}, {x: 2, y: 1}]
    ],

    // arrow type
    [
        // arrow rotations
        [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 2, y: 1}],
        [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 2, y: 2}],
        [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}],
        [{x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}, {x: 1, y: 1}]
    ]
];