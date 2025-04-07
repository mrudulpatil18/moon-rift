"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b, _c;
var canvas = document.getElementById("canvas");
var initialOptions = document.getElementById("initial-options");
var joinForm = document.getElementById("join-form");
var waitingMessage = document.getElementById("waiting-message");
var errorMessage = document.getElementById("error-message");
var errorText = document.getElementById("error-text");
var cancelButtons = document.querySelectorAll(".reload");
var ui = document.querySelector(".game-ui");
window.onload = function () {
    setTimeout(loadBackground, 200);
};
// @ts-ignore
initialOptions.hidden = false;
joinForm.hidden = true;
waitingMessage.hidden = true;
errorMessage.hidden = true;
// Create Room button
(_a = document.getElementById("create-button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function (e) {
    initialOptions.style.display = "none";
    waitingMessage.hidden = false;
    errorMessage.hidden = true;
    joinForm.hidden = true;
    startRunner();
});
// Join Room button
(_b = document.getElementById("join-button")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function (e) {
    initialOptions.style.display = "none";
    waitingMessage.hidden = true;
    errorMessage.hidden = true;
    joinForm.hidden = false;
    var roomInput = document.querySelector("#room");
    roomInput.focus();
    roomInput.textContent = "";
});
// Join form submission
(_c = document.getElementById("join-form")) === null || _c === void 0 ? void 0 : _c.addEventListener("submit", function (e) {
    e.preventDefault();
    // @ts-ignore
    var roomCode = document.getElementById("room").value;
    joinForm.hidden = true;
    waitingMessage.hidden = false;
    startRunner(roomCode);
});
for (var _i = 0, cancelButtons_1 = cancelButtons; _i < cancelButtons_1.length; _i++) {
    var button = cancelButtons_1[_i];
    button.addEventListener("click", function (e) {
        window.location.reload();
    });
}
var data;
var ctx;
var player;
var camera;
var socket;
var gameInitialized = false;
var SERVER_URL = "mazerunner-ynnb.onrender.com";
// const SERVER_URL = "localhost:8080"
var thickGrid;
var landTileTypeArray;
var treeTileTypeArray;
var TILE_WIDTH = 32;
var TILE_WIDTH_HALF = 16;
var TILE_HEIGHT = 16;
var TILE_HEIGHT_HALF = 8;
var isDown = false;
var mousePosStartX, mousePosStartY;
var mousePosEndX, mousePosEndY;
var extraTiles = 0;
var prevValidPos;
var canMove = true;
var tileAtlas = new Image();
tileAtlas.src = "./moon_tileset.png";
var towerTiles = new Image();
towerTiles.src = "./Tower-Sheet.png";
var mageTiles = new Image();
mageTiles.src = "./Mage-Sheet.png";
// window.addEventListener('mousedown', mousedown)
// window.addEventListener('mousemove', mousemove)
// window.addEventListener('mouseup', mouseup)
window.addEventListener('resize', resizeCanvas);
// window.addEventListener('wheel', mousewheel);
window.addEventListener("keydown", moveSomething, false);
// window.onload = startRunner;
function startRunner() {
    return __awaiter(this, arguments, void 0, function (id) {
        if (id === void 0) { id = null; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = canvas.getContext("2d");
                    ctx.imageSmoothingEnabled = false;
                    accountForDPI(canvas);
                    return [4 /*yield*/, createRoom(id)];
                case 1:
                    socket = _a.sent();
                    console.log(socket);
                    return [2 /*return*/, socket];
            }
        });
    });
}
function resizeCanvas() {
    if (!gameInitialized) {
        return;
    }
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx === null || ctx === void 0 ? void 0 : ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    var canvasB = document.getElementById("background-canvas"), context = canvasB.getContext("2d");
    canvasB.style.width = window.innerWidth + 'px';
    canvasB.style.height = window.innerHeight + 'px';
    canvasB.width = window.innerWidth * window.devicePixelRatio;
    canvasB.height = window.innerHeight * window.devicePixelRatio;
    context === null || context === void 0 ? void 0 : context.scale(window.devicePixelRatio, window.devicePixelRatio);
}
function moveSomething(e) {
    if (player == null) {
        return;
    }
    switch (e.keyCode) {
        case 37:
            // left key pressed
            player.makeMove(Direction.Left);
            console.log("Left pressed, new pos: " + player.position.Tx + " " + player.position.Ty);
            break;
        case 38:
            // up key pressed
            player.makeMove(Direction.Up);
            console.log("Up pressed, new pos: " + player.position.Tx + " " + player.position.Ty);
            break;
        case 39:
            // right key pressed
            player.makeMove(Direction.Right);
            console.log("Right pressed, new pos: " + player.position.Tx + " " + player.position.Ty);
            break;
        case 40:
            // down key pressed
            player.makeMove(Direction.Down);
            console.log("Down pressed, new pos: " + player.position.Tx + " " + player.position.Ty);
            break;
    }
}
function accountForDPI(canvas) {
    // Get device pixel ratio
    var dpr = window.devicePixelRatio || 1;
    // Get the canvas size from CSS
    var rect = canvas.getBoundingClientRect();
    // Set the canvas internal dimensions to match DPI
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    // Scale all canvas operations to account for DPI
    ctx.scale(dpr, dpr);
    // Reset the canvas display size
    canvas.style.width = "".concat(rect.width, "px");
    canvas.style.height = "".concat(rect.height, "px");
}
function createRoom() {
    return __awaiter(this, arguments, void 0, function (room) {
        var responseData, response, room_code_val, socket;
        if (room === void 0) { room = null; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(room == null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetch("https://".concat(SERVER_URL, "/room/create"), {
                            method: "POST",
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("Error: ".concat(response.status, " ").concat(response.statusText));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, response.text()];
                case 2:
                    responseData = _a.sent(); // Assuming the API returns a string
                    console.log(responseData);
                    room_code_val = document.querySelector("#roomcode");
                    navigator.clipboard.writeText(responseData);
                    room_code_val.innerHTML = "<div>".concat(responseData, "</div>");
                    return [3 /*break*/, 4];
                case 3:
                    responseData = room;
                    console.log("joining: " + responseData);
                    _a.label = 4;
                case 4:
                    socket = new WebSocket("wss://".concat(SERVER_URL, "/websocket?room=").concat(responseData));
                    socket.onopen = function () {
                        console.log("WebSocket connection established.");
                        // Request maze data once connection is established
                        if (socket.readyState === WebSocket.OPEN) {
                            console.log("WebSocket connection established.");
                        }
                    };
                    socket.onmessage = function (event) {
                        var messageData = JSON.parse(event.data);
                        console.log("RECEIVED MESSAGE", messageData);
                        if (messageData.hasOwnProperty("wallH")) {
                            data = messageData;
                            prevValidPos = { x: data.startX, y: data.startY };
                            // Initialize player after receiving maze data
                            thickGrid = getThickWalledMaze(data);
                            extraTiles = thickGrid.length - 2;
                            landTileTypeArray = generateRandomTileTypes(thickGrid.length, extraTiles, 7);
                            treeTileTypeArray = generateRandomTileTypes(thickGrid.length, extraTiles, 20);
                            initializeGame();
                        }
                        if (messageData == "START_GAME") {
                            canvas.hidden = false;
                            waitingMessage.hidden = true;
                            initialOptions.hidden = true;
                            joinForm.hidden = true;
                            errorMessage.hidden = true;
                            sendMessage({ statusMessage: "GET_MAZE_NEW_LEVEL" });
                        }
                        if (messageData == "UPDATE_MAZE_LEVEL") {
                            gameInitialized = false;
                            setTimeout(function () {
                                sendMessage({ statusMessage: "GET_MAZE_NEW_LEVEL" });
                                console.log("Received message:", messageData);
                            }, 100);
                        }
                        if (messageData == "RESET_MAZE") {
                            gameInitialized = false;
                            setTimeout(function () {
                                sendMessage({ statusMessage: "GET_MAZE_SAME_LEVEL" });
                                console.log("Received message:", messageData);
                            }, 100);
                        }
                        if (messageData == "INVALID_MOVE") {
                            console.log("Invalid Move");
                        }
                        if (messageData == "GAME_OVER_WIN" || messageData == "GAME_OVER_LOSS") {
                            canMove = false;
                            ui.hidden = false;
                            var resultDiv = document.querySelector("#result-text");
                            var result = document.querySelector("#result");
                            result.hidden = false;
                            if (messageData == "GAME_OVER_LOSS") {
                                resultDiv.innerHTML = "<h1 style='color: red'>YOU LOST!</h1>";
                            }
                            else {
                                resultDiv.innerHTML = "<h1 style='color: green'>YOU WON!</h1>";
                            }
                        }
                    };
                    socket.onerror = function (error) {
                        console.error("WebSocket error: ", error);
                    };
                    socket.onclose = function (event) {
                        console.log("WebSocket connection closed:", event);
                        if (!gameInitialized) {
                            waitingMessage.hidden = true;
                            errorText.textContent = event.reason || "Connection failed. Please check the room code.";
                            errorMessage.hidden = false;
                        }
                    };
                    return [2 /*return*/, socket];
            }
        });
    });
}
function initializeGame() {
    ui.hidden = true;
    document.querySelector('.title-imgs').style.display = 'none';
    document.querySelector('.game-title').style.display = 'none';
    if (!gameInitialized && data) {
        // Calculate the center of the thickGrid
        var gridCenter = {
            x: (thickGrid.length - 1) / 2,
            y: (thickGrid.length - 1) / 2
        };
        var screenCenter = map_to_screen(gridCenter);
        var minGridX = 0;
        var maxGridX = thickGrid.length - 1;
        var minGridY = 0;
        var maxGridY = thickGrid.length - 1;
        var corners = [
            { x: minGridX, y: minGridY },
            { x: maxGridX, y: minGridY },
            { x: minGridX, y: maxGridY },
            { x: maxGridX, y: maxGridY },
        ];
        var worldCorners = corners.map(function (c) { return map_to_screen(c); });
        var minWorldX = Math.min.apply(Math, worldCorners.map(function (c) { return c.x; }));
        var maxWorldX = Math.max.apply(Math, worldCorners.map(function (c) { return c.x; }));
        var minWorldY = Math.min.apply(Math, worldCorners.map(function (c) { return c.y; }));
        var maxWorldY = Math.max.apply(Math, worldCorners.map(function (c) { return c.y; }));
        var worldWidth = maxWorldX - minWorldX;
        var worldHeight = maxWorldY - minWorldY;
        var dpr = window.devicePixelRatio || 1;
        var canvasWidth = canvas.width / dpr;
        var canvasHeight = canvas.height / dpr;
        var zoomWidth = canvasWidth / worldWidth;
        var zoomHeight = canvasHeight / worldHeight;
        var desiredZoom = Math.min(zoomWidth, zoomHeight) * (thickGrid.length == 9 ? 0.4 : thickGrid.length == 11 ? 0.47 : thickGrid.length == 13 ? 0.54 : 0.6);
        camera = new Camera(desiredZoom);
        camera.position = {
            x: screenCenter.x - (canvas.width / (2 * dpr * camera.zoom)) + TILE_WIDTH / 2,
            y: screenCenter.y - (canvas.height / (2 * dpr * camera.zoom))
        };
        player = new Player(thinToThickCord({ x: data.startX, y: data.startY }), 19, 6);
        gameInitialized = true;
        canvas.hidden = false;
        canMove = true;
        updateTileSizes(32);
        window.requestAnimationFrame(gameLoop);
        console.log("Game initialized with player at: ", data.startX, data.startY);
    }
}
function gameLoop(timeStamp) {
    if (!data || !player)
        return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    camera.applyTransform();
    drawMaze(data, thickGrid, camera);
    camera.resetTransform();
    window.requestAnimationFrame(gameLoop);
}
function drawMaze(data, grid, camera) {
    if (!data)
        return;
    var endX = data.endX, endY = data.endY;
    if (ctx) {
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.strokeStyle = Math.random() > 0.5 ? "white" : "white";
        // // Draw outer border
        // ctx.beginPath();
        // ctx.rect(s, s, s * width, s * height);
        // ctx.stroke();
        //
        // // Draw walls
        // ctx.beginPath();
        // for (let x = 0; x < width; x++) {
        //   for (let y = 0; y < height; y++) {
        //     // Draw horizontal walls (when wallH is 1)
        //     if (wallH[x][y] === 1) {
        //       ctx.moveTo(s + x * s, s + (y + 1) * s);
        //       ctx.lineTo(s + (x + 1) * s, s + (y + 1) * s);
        //     }
        //
        //     // Draw vertical walls (when wallV is 1)
        //     if (wallV[x][y] === 1) {
        //       ctx.moveTo(s + (x + 1) * s, s + y * s);
        //       ctx.lineTo(s + (x + 1) * s, s + (y + 1) * s);
        //     }
        //   }
        // }
        // ctx.stroke();
        // Draw start and end points
        // if (startX !== undefined && startY !== undefined) {
        //   ctx.fillStyle = "green";
        //   ctx.beginPath();
        //   ctx.arc(
        //     s + startX * s + s / 2,
        //     s + startY * s + s / 2,
        //     s / 4,
        //     0,
        //     2 * Math.PI
        //   );
        //   ctx.fill();
        // }
        //
        // if (endX !== undefined && endY !== undefined) {
        //   ctx.fillStyle = "red";
        //   ctx.beginPath();
        //   ctx.arc(
        //     s + endX * s + s / 2,
        //     s + endY * s + s / 2,
        //     s / 4,
        //     0,
        //     2 * Math.PI
        //   );
        //   ctx.fill();
        // }
        var center = { x: (grid.length - 1) / 2, y: (grid.length - 1) / 2 };
        // draw maze
        for (var i = -extraTiles; i < grid.length + extraTiles; i++) {
            for (var j = -extraTiles; j < grid.length + extraTiles; j++) {
                var pos = map_to_screen({ x: i, y: j });
                // if(i == grid.length+extraTiles-1 && j == grid.length+extraTiles-1){
                //   drawTile(pos, camera, "CORNER");
                // }else if(i == grid.length+extraTiles-1){
                //   drawTile(pos, camera, "RIGHT_EDGE");
                // }else if(j == grid.length+extraTiles-1){
                //   drawTile(pos, camera, "LEFT_EDGE");
                // }else if(){
                if (dist({ x: i, y: j }, center) <= grid.length / 2 + extraTiles / 2) {
                    if (i > 0 && i < grid.length - 1 && j > 0 && j < grid.length - 1) {
                        drawTile(pos, camera, "LAND7");
                    }
                    else {
                        drawTile(pos, camera, "LAND".concat(landTileTypeArray[i + extraTiles][j + extraTiles]));
                    }
                }
                // }
                if (i < 0 || j < 0 || i >= grid.length || j >= grid.length) {
                    //dont draw blocking tree in front
                    if ((i > grid.length - 1 && i < grid.length + 2) != (j > grid.length - 1 && j < grid.length + 2)) {
                        continue;
                    }
                    if (dist({ x: i, y: j }, center) <= grid.length / 2 + extraTiles / 2) {
                        drawTile(pos, camera, "TREE".concat(treeTileTypeArray[i + extraTiles][j + extraTiles]));
                    }
                    continue;
                }
                if (i == 0 || j == 0 || i == grid.length - 1 || j == grid.length - 1) { }
                // drawIsometricTile(pos, ctx, false, camera
                if (i == 2 * (endX) + 1 && j == 2 * (endY) + 1 && !isEqualCoordinates(thickToThinCord(player.position), { x: endX, y: endY })) {
                    // drawImpOnIsometricMaze(pos, ctx, camera);
                    drawTower(pos, camera);
                    continue;
                }
                // @ts-ignore
                if (grid[i][j] == 1) {
                    // drawIsometricTile(pos, ctx, true, camera)
                    drawTile(pos, camera, "WALL");
                }
                if (isEqualCoordinates(thickToThinCord(player.position), thickToThinCord({ Tx: i, Ty: j }))) {
                    player.draw();
                }
            }
        }
    }
}
function dist(pt1, pt2) {
    return Math.floor(Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2)));
}
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
var animationStates = [
    {
        name: "idle_up",
        sheetY: 21,
        frames: 6
    },
    {
        name: "idle_down",
        sheetY: 3,
        frames: 6
    },
    {
        name: "idle_left",
        sheetY: 9,
        frames: 6
    },
    {
        name: "idle_right",
        sheetY: 15,
        frames: 6
    },
    {
        name: "move_up",
        sheetY: 22,
        frames: 6
    },
    {
        name: "move_down",
        sheetY: 4,
        frames: 6
    },
    {
        name: "move_left",
        sheetY: 10,
        frames: 6
    },
    {
        name: "move_right",
        sheetY: 16,
        frames: 6
    },
];
var TileType = {
    "LAND0": { x: 0, y: 0 },
    "LAND1": { x: 1, y: 0 },
    "LAND2": { x: 2, y: 0 },
    "LAND3": { x: 3, y: 0 },
    "LAND4": { x: 4, y: 0 },
    "LAND5": { x: 5, y: 0 },
    "LAND6": { x: 6, y: 0 },
    "LAND7": { x: 7, y: 0 },
    "LEFT_EDGE": { x: 0, y: 1 },
    "RIGHT_EDGE": { x: 1, y: 1 },
    "CORNER": { x: 2, y: 1 },
    // "LEFT_WALL": {x: 2, y: 2},
    // "RIGHT_WALL": {x: 4, y: 2},
    "WALL": { x: 4, y: 3 },
    "TREE0": { x: 0, y: 4 },
    "TREE1": { x: 1, y: 4 },
    "TREE2": { x: 2, y: 4 },
    "TREE3": { x: 3, y: 4 },
    "TREE4": { x: 4, y: 4 },
    "TREE_EMPTY": { x: 5, y: 4 },
};
// function findNextPath( maze: MazeResponse, curr: Coordinate, prev = { x: -1, y: -1 }): Array<Coordinate> {
//   const path = [];
//   while (true) {
//     const currCellExits = fetchExitInfoOld(maze, curr);
//     const filteredExits= removeItem(currCellExits, prev, isEqualCoordinates);
//     if (filteredExits.length != 1) {
//       break;
//     }
//     for (let cell of filteredExits) {
//       prev = curr;
//       curr = cell;
//       path.push(curr);
//     }
//   }
//   return path;
// }
function fetchExitInfo(thickMaze, curr) {
    // console.log(thickMaze)
    var currX = curr.Tx;
    var currY = curr.Ty;
    var exits = new Array();
    // @ts-ignore
    if (currX < thickMaze.length && thickMaze[currX + 1][currY] == 0) {
        exits.push({ Tx: currX + 1, Ty: currY });
    }
    // @ts-ignore
    if (currY < thickMaze.length && thickMaze[currX][currY + 1] == 0) {
        exits.push({ Tx: currX, Ty: currY + 1 });
    }
    // @ts-ignore
    if (currX - 1 > 0 && thickMaze[currX - 1][currY] == 0) {
        exits.push({ Tx: currX - 1, Ty: currY });
    }
    // @ts-ignore
    if (currY - 1 > 0 && thickMaze[currX][currY - 1] == 0) {
        exits.push({ Tx: currX, Ty: currY - 1 });
    }
    return exits;
}
// function fetchExitInfoOld(maze: MazeResponse, curr: Coordinate): Array<Coordinate> {
//   const { wallH, wallV } = maze;
//   const currX = curr.x;
//   const currY = curr.y;
//   const exits = new Array<Coordinate>();
//   if (wallH[currX][currY] == 0) {
//     exits.push({ x: currX, y: currY + 1 });
//   }
//   if (currY > 0 && wallH[currX][currY - 1] == 0) {
//     exits.push({ x: currX, y: currY - 1 });
//   }
//   if (wallV[currX][currY] == 0) {
//     exits.push({ x: currX + 1, y: currY });
//   }
//   if (currX > 0 && wallV[currX - 1][currY] == 0) {
//     exits.push({ x: currX - 1, y: currY });
//   }
//   return exits;
// }
function removeItem(arr, value, compareFn) {
    var index = arr.findIndex(function (item) { return compareFn(item, value); });
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}
function isEqualCoordinates(a, b) {
    return a.x == b.x && a.y == b.y;
}
function sendMessage(message) {
    if ((socket === null || socket === void 0 ? void 0 : socket.readyState) === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        console.log("Message Sent: " + JSON.stringify(message));
    }
    else {
        console.error("WebSocket connection is not open. but why ? ");
    }
}
function updateTileSizes(num) {
    TILE_WIDTH = num;
    TILE_WIDTH_HALF = TILE_WIDTH / 2;
    TILE_HEIGHT = TILE_WIDTH / 2;
    TILE_HEIGHT_HALF = TILE_HEIGHT / 2;
}
function map_to_screen(map) {
    var screen = { x: 0, y: 0 };
    screen.x = (map.x - map.y) * TILE_WIDTH_HALF;
    screen.y = (map.x + map.y) * TILE_HEIGHT_HALF;
    return screen;
}
function drawIsometricTile(isoOrigin, ctx, isBlock, camera) {
    if (isBlock === void 0) { isBlock = false; }
    var blockHeight = isBlock ? TILE_HEIGHT_HALF * 1.7 : TILE_HEIGHT_HALF * 0.3;
    isoOrigin = isBlock ? moveFromOrigin(isoOrigin, { x: 0, y: -1 * blockHeight }) : isoOrigin;
    //top
    var tileLeft = moveFromOrigin(isoOrigin, { x: -TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF });
    var tileRight = moveFromOrigin(isoOrigin, { x: TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF });
    var tileBottom = moveFromOrigin(isoOrigin, { x: 0, y: TILE_HEIGHT });
    var cubeBottom = moveFromOrigin(isoOrigin, { x: 0, y: TILE_HEIGHT + blockHeight });
    var cubeLeft = moveFromOrigin(isoOrigin, { x: -TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF / 2 });
    var cubeRight = moveFromOrigin(isoOrigin, { x: TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF / 2 });
    ctx.beginPath();
    ctx.moveTo(isoOrigin.x, isoOrigin.y);
    ctx.lineTo(tileLeft.x, tileLeft.y);
    ctx.lineTo(tileBottom.x, tileBottom.y);
    ctx.lineTo(tileRight.x, tileRight.y);
    ctx.closePath();
    ctx.fillStyle = isBlock ? "#fba52d" : "#232121";
    ctx.fill();
    //left
    ctx.beginPath();
    ctx.lineTo(tileLeft.x, tileLeft.y);
    ctx.lineTo(cubeLeft.x, cubeLeft.y);
    ctx.lineTo(cubeBottom.x, cubeBottom.y);
    ctx.lineTo(tileBottom.x, tileBottom.y);
    ctx.closePath();
    ctx.fillStyle = "#aa5b0a";
    ctx.fill();
    //right
    ctx.beginPath();
    ctx.lineTo(tileRight.x, tileRight.y);
    ctx.lineTo(cubeRight.x, cubeRight.y);
    ctx.lineTo(cubeBottom.x, cubeBottom.y);
    ctx.lineTo(tileBottom.x, tileBottom.y);
    ctx.closePath();
    ctx.fillStyle = "#ed8b1c";
    ctx.fill();
}
function drawImpOnIsometricMaze(isoOrigin, ctx, camera, isStart) {
    if (isStart === void 0) { isStart = false; }
    var wobble = (Math.sin(Date.now() / 250) + 1) * (isStart ? 0 : 5); // Adjust amplitude as needed
    isoOrigin = __assign(__assign({}, isoOrigin), { y: isoOrigin.y - wobble - (isStart ? TILE_HEIGHT : TILE_HEIGHT_HALF * 1.7) });
    var blockHeight = TILE_HEIGHT;
    // Calculate cube points
    var tileLeft = moveFromOrigin(isoOrigin, { x: -TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF });
    var tileRight = moveFromOrigin(isoOrigin, { x: TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF });
    var tileBottom = moveFromOrigin(isoOrigin, { x: 0, y: TILE_HEIGHT });
    var cubeBottom = moveFromOrigin(isoOrigin, { x: 0, y: TILE_HEIGHT + blockHeight });
    var cubeLeft = moveFromOrigin(isoOrigin, { x: -TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF / 2 });
    var cubeRight = moveFromOrigin(isoOrigin, { x: TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF / 2 });
    // Draw top face with animation
    ctx.beginPath();
    ctx.moveTo(isoOrigin.x, isoOrigin.y);
    ctx.lineTo(tileLeft.x, tileLeft.y);
    ctx.lineTo(tileBottom.x, tileBottom.y);
    ctx.lineTo(tileRight.x, tileRight.y);
    ctx.closePath();
    ctx.fillStyle = isStart ? "#33ff33aa" : '#ff5933cc'; // Top color with transparency
    ctx.fill();
    // Draw left face
    ctx.beginPath();
    ctx.moveTo(tileLeft.x, tileLeft.y);
    ctx.lineTo(cubeLeft.x, cubeLeft.y);
    ctx.lineTo(cubeBottom.x, cubeBottom.y);
    ctx.lineTo(tileBottom.x, tileBottom.y);
    ctx.closePath();
    ctx.fillStyle = isStart ? "#00e000aa" : '#e60d00cc'; // Left color with transparency
    ctx.fill();
    // Draw right face
    ctx.beginPath();
    ctx.moveTo(tileRight.x, tileRight.y);
    ctx.lineTo(cubeRight.x, cubeRight.y);
    ctx.lineTo(cubeBottom.x, cubeBottom.y);
    ctx.lineTo(tileBottom.x, tileBottom.y);
    ctx.closePath();
    ctx.fillStyle = isStart ? "#1aff1aaa" : '#ff401acc'; // Right color with transparency
    ctx.fill();
}
function moveFromOrigin(isoOrigin, cord) {
    return { x: isoOrigin.x + cord.x, y: isoOrigin.y + cord.y };
}
function getThickWalledMaze(maze) {
    var width = maze.width, height = maze.height, wallH = maze.wallH, wallV = maze.wallV;
    var dimWidth = 2 * width + 1;
    var dimHeight = 2 * height + 1;
    var grid = new Array(dimWidth).fill(0).map(function () { return new Uint8Array(dimHeight); });
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            // Draw horizontal walls (when wallH is 1)
            if (wallH[x][y] == 1) {
                // @ts-ignore
                grid[2 * x + 1][2 * (y + 1)] = 1;
            }
            // Draw vertical walls (when wallV is 1)
            if (wallV[x][y] == 1) {
                // @ts-ignore
                grid[2 * (x + 1)][2 * y + 1] = 1;
            }
            // @ts-ignore
            grid[2 * x][2 * y] = 1;
        }
    }
    for (var x = 0; x < dimWidth; x++) {
        for (var y = 0; y < dimHeight; y++) {
            if (x == 0 || y == 0 || x == dimWidth - 1 || y == dimHeight - 1) {
                // @ts-ignore
                grid[x][y] = 1;
            }
        }
    }
    // console.log(grid);
    return grid;
}
var Player = /** @class */ (function () {
    function Player(position, v, radius) {
        var _this = this;
        this.spriteAnimations = [];
        this.position = position;
        this.v = v;
        this.radius = radius;
        this.playerState = "idle_right";
        this.gameFrame = 0;
        this.staggerFrames = 4;
        this.mageImgWidth = 32;
        this.mageImgHeight = 48;
        this.futurePos = [];
        animationStates.forEach(function (state, index) {
            var frames = {
                loc: []
            };
            for (var i = 0; i < state.frames; i++) {
                var positionX = i * _this.mageImgWidth;
                var positionY = state.sheetY * _this.mageImgHeight;
                frames.loc.push({ x: positionX, y: positionY });
            }
            _this.spriteAnimations[state.name] = frames;
        });
        console.log(this.spriteAnimations);
    }
    Player.prototype.draw = function () {
        // Animation logic
        var maxFrame = this.spriteAnimations[this.playerState].loc.length;
        var position = Math.floor(this.gameFrame / this.staggerFrames) % maxFrame;
        var frameX = this.mageImgWidth * position;
        var frameY = this.spriteAnimations[this.playerState].loc[position].y;
        if (!canMove && this.futurePos.length > 0) {
            // We're in the middle of an animation
            var screenCord = this.futurePos[0];
            // Apply the same offset as you do for the standing position
            screenCord = moveFromOrigin(screenCord, { x: 0, y: -TILE_HEIGHT - 18 });
            ctx.drawImage(mageTiles, frameX, frameY, this.mageImgWidth, this.mageImgHeight, screenCord.x, screenCord.y, this.mageImgWidth, this.mageImgHeight);
            this.gameFrame++;
            this.futurePos.shift();
            if (this.futurePos.length == 0) {
                canMove = true;
                // Set the player state back to idle once animation is complete
                this.playerState = this.playerState.replace('move_', 'idle_');
            }
        }
        else {
            // Normal rendering when not moving
            // @ts-ignore
            var screenCord = map_to_screen({ x: this.position.Tx, y: this.position.Ty });
            // Apply the offset
            screenCord = moveFromOrigin(screenCord, { x: 0, y: -TILE_HEIGHT - 18 });
            ctx.drawImage(mageTiles, frameX, frameY, this.mageImgWidth, this.mageImgHeight, screenCord.x, screenCord.y, this.mageImgWidth, this.mageImgHeight);
            this.gameFrame++;
            // When not moving, revert to idle state
            if (canMove && this.playerState.includes('move_')) {
                this.playerState = this.playerState.replace('move_', 'idle_');
            }
        }
    };
    Player.prototype.makeMove = function (direction) {
        if (!canMove || isEqualCoordinates(thickToThinCord(this.position), { x: data.endX, y: data.endY })) {
            return;
        }
        var curr = this.position;
        var exits = fetchExitInfo(thickGrid, curr);
        var dx = 0, dy = 0;
        var new_state;
        switch (direction) {
            case Direction.Down:
                dy = 1;
                new_state = "move_down";
                break;
            case Direction.Up:
                dy = -1;
                new_state = "move_up";
                break;
            case Direction.Left:
                dx = -1;
                new_state = "move_left";
                break;
            case Direction.Right:
                dx = 1;
                new_state = "move_right";
                break;
        }
        var next = { Tx: curr.Tx + dx, Ty: curr.Ty + dy };
        if (exits.find(function (e) { return e.Tx == next.Tx && e.Ty == next.Ty; })) {
            // Set player state before movement
            this.playerState = new_state;
            // Disable movement during animation
            canMove = false;
            // Record when we reach a valid position (junction)
            if (next.Tx % 2 == 1 && next.Ty % 2 == 1) {
                sendMessage({ from: prevValidPos, to: thickToThinCord(next) });
                prevValidPos = thickToThinCord(next);
            }
            this.futurePos = [];
            var oldScreen = map_to_screen({ x: curr.Tx, y: curr.Ty });
            var newScreen = map_to_screen({ x: next.Tx, y: next.Ty });
            var changeX = newScreen.x - oldScreen.x;
            var changeY = newScreen.y - oldScreen.y;
            var minFrames = 12; // Minimum frames to show movement visibly
            var stepX = changeX / minFrames;
            var stepY = changeY / minFrames;
            var x = oldScreen.x;
            var y = oldScreen.y;
            for (var i = 0; i < minFrames; i++) {
                this.futurePos.push({ x: x, y: y });
                x += stepX;
                y += stepY;
            }
            this.futurePos.push({ x: newScreen.x, y: newScreen.y });
            // Actually update the player's position only after creating animation frames
            this.moveTo(next);
        }
    };
    Player.prototype.moveTo = function (next) {
        this.position = next;
    };
    return Player;
}());
var Camera = /** @class */ (function () {
    function Camera(initialScale) {
        this.position = { x: 0, y: 0 };
        this.zoom = initialScale;
        this.rotate = 0;
    }
    Camera.prototype.applyTransform = function () {
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.position.x, -this.position.y);
    };
    Camera.prototype.resetTransform = function () {
        ctx.restore();
    };
    return Camera;
}());
function mousedown(event) {
    if (!isDown) {
        mousePosStartX = event.pageX;
        mousePosStartY = event.pageY;
        isDown = true;
        event.preventDefault();
    }
}
function mousemove(event) {
    if (isDown) {
        mousePosEndX = event.pageX;
        mousePosEndY = event.pageY;
        // Use a smaller factor for smoother camera movement
        var movementFactor = 3;
        var changeX = (mousePosStartX - mousePosEndX) * TILE_WIDTH_HALF * data.width / canvas.width * movementFactor;
        var changeY = (mousePosStartY - mousePosEndY) * TILE_HEIGHT_HALF * data.height / canvas.height * movementFactor;
        camera.position = moveFromOrigin(camera.position, { x: changeX, y: changeY });
        // Update start position for the next move
        mousePosStartX = mousePosEndX;
        mousePosStartY = mousePosEndY;
    }
}
function mouseup() {
    if (isDown) {
        isDown = false;
    }
}
function mousewheel(event) {
    event.preventDefault();
    var delta = Math.sign(event.deltaY);
    var zoomFactor = 0.01;
    if (delta < 0) {
        camera.zoom = Math.min(2, camera.zoom + zoomFactor);
    }
    else {
        // Zoom in
        camera.zoom = Math.max(0.5, camera.zoom - zoomFactor);
    }
    // console.log(camera)
}
function thinToThickCord(cord) {
    return { Tx: 2 * cord.x + 1, Ty: 2 * cord.y + 1 };
}
function thickToThinCord(tCord) {
    return { x: (tCord.Tx - 1) / 2, y: (tCord.Ty - 1) / 2 };
}
function drawTile(screenCord, camera, tileType) {
    var tsize = TILE_WIDTH;
    // @ts-ignore
    var tilePosCord = TileType[tileType];
    if (tileType.startsWith("WALL")) {
        screenCord = moveFromOrigin(screenCord, { x: 0, y: -TILE_HEIGHT });
    }
    if (tileType.startsWith("TREE") && +tileType.replace("TREE", "") > 4) {
        return;
    }
    if (tileType.startsWith("TREE")) {
        screenCord = moveFromOrigin(screenCord, { x: 0, y: -4 * TILE_HEIGHT });
        ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(tileAtlas, (tilePosCord.x) * tsize, (tilePosCord.y) * tsize, tsize, 3 * tsize, screenCord.x, screenCord.y, tsize, 3 * tsize);
    }
    else {
        ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(tileAtlas, (tilePosCord.x) * tsize, tilePosCord.y * tsize, tsize, tsize, screenCord.x, screenCord.y, tsize, tsize);
    }
}
function generateRandomTileTypes(gridSize, extraTiles, maxValue) {
    if (maxValue === void 0) { maxValue = 7; }
    var totalSize = gridSize + 2 * extraTiles;
    return Array.from({ length: totalSize }, function () {
        return Array.from({ length: totalSize }, function () {
            return Math.floor(Math.random() * maxValue);
        });
    });
}
function drawTower(screenCord, camera) {
    var towerImgWidth = 64;
    var towerImgHeight = 96;
    //adjust offset and also get the tower to center
    screenCord = moveFromOrigin(screenCord, { x: 0, y: -towerImgHeight / 2 + towerImgHeight / 8 });
    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(towerTiles, 2 * towerImgWidth, 0, towerImgWidth, towerImgHeight, screenCord.x, screenCord.y, towerImgWidth / 2, towerImgHeight / 2);
}
/// BACKGROUNDS
function loadBackground() {
    //Helpers
    function lineToAngle(x1, y1, length, radians) {
        var x2 = x1 + length * Math.cos(radians), y2 = y1 + length * Math.sin(radians);
        return { x: x2, y: y2 };
    }
    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }
    function degreesToRads(degrees) {
        return degrees / 180 * Math.PI;
    }
    //Particle
    var particle = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,
        create: function (x, y, speed, direction) {
            var obj = Object.create(this);
            obj.x = x;
            obj.y = y;
            obj.vx = Math.cos(direction) * speed;
            obj.vy = Math.sin(direction) * speed;
            return obj;
        },
        getSpeed: function () {
            return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        },
        setSpeed: function (speed) {
            var heading = this.getHeading();
            this.vx = Math.cos(heading) * speed;
            this.vy = Math.sin(heading) * speed;
        },
        getHeading: function () {
            return Math.atan2(this.vy, this.vx);
        },
        setHeading: function (heading) {
            var speed = this.getSpeed();
            this.vx = Math.cos(heading) * speed;
            this.vy = Math.sin(heading) * speed;
        },
        update: function () {
            this.x += this.vx;
            this.y += this.vy;
        }
    };
    //Canvas and settings
    var canvasB = document.getElementById("background-canvas"), context = canvasB.getContext("2d"), width = canvasB.width = window.innerWidth, height = canvasB.height = window.innerHeight, stars = [], shootingStars = [], layers = [
        { speed: 0.015, scale: 0.2, count: 200 },
        { speed: 0.03, scale: 0.5, count: 50 },
        { speed: 0.05, scale: 0.75, count: 30 }
    ], starsAngle = 145, shootingStarSpeed = {
        min: 15,
        max: 20
    }, shootingStarOpacityDelta = 0.01, trailLengthDelta = 0.01, shootingStarEmittingInterval = 2000, shootingStarLifeTime = 500, maxTrailLength = 300, starBaseRadius = 2, shootingStarRadius = 3, paused = false;
    //Create all stars
    for (var j = 0; j < layers.length; j += 1) {
        var layer = layers[j];
        for (var i = 0; i < layer.count; i += 1) {
            var star = particle.create(randomRange(0, width), randomRange(0, height), 0, 0);
            star.radius = starBaseRadius * layer.scale;
            star.setSpeed(layer.speed);
            star.setHeading(degreesToRads(starsAngle));
            stars.push(star);
        }
    }
    function createShootingStar() {
        var shootingStar = particle.create(randomRange(width / 2, width), randomRange(0, height / 2), 0, 0);
        shootingStar.setSpeed(randomRange(shootingStarSpeed.min, shootingStarSpeed.max));
        shootingStar.setHeading(degreesToRads(starsAngle));
        shootingStar.radius = shootingStarRadius;
        shootingStar.opacity = 0;
        shootingStar.trailLengthDelta = 0;
        shootingStar.isSpawning = true;
        shootingStar.isDying = false;
        shootingStars.push(shootingStar);
    }
    function killShootingStar(shootingStar) {
        setTimeout(function () {
            shootingStar.isDying = true;
        }, shootingStarLifeTime);
    }
    function update() {
        if (!paused) {
            context.clearRect(0, 0, width, height);
            context.fillStyle = "#242438";
            context.fillRect(0, 0, width, height);
            context.fill();
            for (var i = 0; i < stars.length; i += 1) {
                var star = stars[i];
                star.update();
                drawStar(star);
                if (star.x > width) {
                    star.x = 0;
                }
                if (star.x < 0) {
                    star.x = width;
                }
                if (star.y > height) {
                    star.y = 0;
                }
                if (star.y < 0) {
                    star.y = height;
                }
            }
            for (i = 0; i < shootingStars.length; i += 1) {
                var shootingStar = shootingStars[i];
                if (shootingStar.isSpawning) {
                    shootingStar.opacity += shootingStarOpacityDelta;
                    if (shootingStar.opacity >= 1.0) {
                        shootingStar.isSpawning = false;
                        killShootingStar(shootingStar);
                    }
                }
                if (shootingStar.isDying) {
                    shootingStar.opacity -= shootingStarOpacityDelta;
                    if (shootingStar.opacity <= 0.0) {
                        shootingStar.isDying = false;
                        shootingStar.isDead = true;
                    }
                }
                shootingStar.trailLengthDelta += trailLengthDelta;
                shootingStar.update();
                if (shootingStar.opacity > 0.0) {
                    drawShootingStar(shootingStar);
                }
            }
            //Delete dead shooting shootingStars
            for (i = shootingStars.length - 1; i >= 0; i--) {
                if (shootingStars[i].isDead) {
                    shootingStars.splice(i, 1);
                }
            }
        }
        requestAnimationFrame(update);
    }
    function drawStar(star) {
        context.fillStyle = "rgb(255, 221, 157)";
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
        context.fill();
    }
    function drawShootingStar(p) {
        var x = p.x, y = p.y, currentTrailLength = (maxTrailLength * p.trailLengthDelta), pos = lineToAngle(x, y, -currentTrailLength, p.getHeading());
        context.fillStyle = "rgba(255, 255, 255, " + p.opacity + ")";
        // context.beginPath();
        // context.arc(x, y, p.radius, 0, Math.PI * 2, false);
        // context.fill();
        var starLength = 5;
        context.beginPath();
        context.moveTo(x - 1, y + 1);
        context.lineTo(x, y + starLength);
        context.lineTo(x + 1, y + 1);
        context.lineTo(x + starLength, y);
        context.lineTo(x + 1, y - 1);
        context.lineTo(x, y + 1);
        context.lineTo(x, y - starLength);
        context.lineTo(x - 1, y - 1);
        context.lineTo(x - starLength, y);
        context.lineTo(x - 1, y + 1);
        context.lineTo(x - starLength, y);
        context.closePath();
        context.fill();
        //trail
        context.fillStyle = "rgba(255, 221, 157, " + p.opacity + ")";
        context.beginPath();
        context.moveTo(x - 1, y - 1);
        context.lineTo(pos.x, pos.y);
        context.lineTo(x + 1, y + 1);
        context.closePath();
        context.fill();
    }
    //Run
    update();
    //Shooting stars
    setInterval(function () {
        if (paused)
            return;
        createShootingStar();
    }, shootingStarEmittingInterval);
    window.onfocus = function () {
        paused = false;
    };
    window.onblur = function () {
        paused = true;
    };
}
