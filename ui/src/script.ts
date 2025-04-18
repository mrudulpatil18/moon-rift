"use strict";
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const initialOptions =<HTMLElement> document.getElementById("initial-options");
const joinForm = <HTMLElement>document.getElementById("join-form");
const waitingMessage = <HTMLElement>document.getElementById("waiting-message");
const errorMessage = <HTMLElement>document.getElementById("error-message");
const errorText = <HTMLElement>document.getElementById("error-text");
const cancelButtons = document.querySelectorAll(".reload")

const ui = <HTMLElement>document.querySelector(".game-ui");


window.onload = function() {
  setTimeout(loadBackground, 200);
};


// @ts-ignore
initialOptions.hidden = false;
joinForm.hidden = true;
waitingMessage.hidden = true;
errorMessage.hidden = true;


// Create Room button
document.getElementById("create-button")?.addEventListener("click", (e) => {
  initialOptions.style.display = "none";
  waitingMessage.hidden = false;
  errorMessage.hidden = true;
  joinForm.hidden = true;
  startRunner();
});

// Join Room button
document.getElementById("join-button")?.addEventListener("click", (e) => {
  initialOptions.style.display = "none";
  waitingMessage.hidden = true;
  errorMessage.hidden = true;
  joinForm.hidden = false;
  const roomInput = <HTMLElement>document.querySelector("#room")!;
  roomInput.focus();
  roomInput.textContent = "";
});

// Join form submission
document.getElementById("join-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  // @ts-ignore
  const roomCode = document.getElementById("room").value;
  joinForm.hidden = true;
  waitingMessage.hidden = false;
  startRunner(roomCode);
});

for(let button of cancelButtons){
  button.addEventListener("click", (e) => {
   window.location.reload()
  })
}

let data: MazeResponse;
let ctx: CanvasRenderingContext2D;
let player: Player
let camera: Camera;
let socket: WebSocket | undefined;
let gameInitialized = false;
const SERVER_URL = `mazerunner-ynnb.onrender.com`
// const SERVER_URL = "localhost:8080"
let thickGrid: any;
let landTileTypeArray: Array<Array<number>>;
let treeTileTypeArray: Array<Array<number>>;

let TILE_WIDTH = 32;
let TILE_WIDTH_HALF = 16;
let TILE_HEIGHT = 16;
let TILE_HEIGHT_HALF = 8;

let isDown = false;
let mousePosStartX: number, mousePosStartY: number;
let mousePosEndX: number, mousePosEndY: number;
let extraTiles = 0

let prevValidPos: Coordinate;

let canMove = true;

const tileAtlas = new Image();
tileAtlas.src = "./moon_tileset.png"

const towerTiles = new Image();
towerTiles.src = "./Tower-Sheet.png"

const mageTiles = new Image();
mageTiles.src = "./Mage-Sheet.png"

// window.addEventListener('mousedown', mousedown)
// window.addEventListener('mousemove', mousemove)
// window.addEventListener('mouseup', mouseup)
window.addEventListener('resize', resizeCanvas);
// window.addEventListener('wheel', mousewheel);

window.addEventListener("keydown", moveSomething, false);
// window.onload = startRunner;

async function startRunner(id = null) {

  ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false
  accountForDPI(canvas);
    socket = await createRoom(id);
  console.log(socket);
  return socket;
}

function resizeCanvas() {
  if (!gameInitialized) {
    return;
  }

  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);

  var canvasB = <HTMLCanvasElement>document.getElementById("background-canvas"),
      context = <CanvasRenderingContext2D>canvasB.getContext("2d");

  canvasB.style.width = window.innerWidth + 'px';
  canvasB.style.height = window.innerHeight + 'px';
  canvasB.width = window.innerWidth * window.devicePixelRatio;
  canvasB.height = window.innerHeight * window.devicePixelRatio;
  context?.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function moveSomething(e: { keyCode: any; }) {
  if(player == null){
    return;
  }
	switch(e.keyCode) {
		case 37:
			// left key pressed
      player.makeMove(Direction.Left);
      console.log("Left pressed, new pos: " + player.position.Tx + " " + player.position.Ty)
			break;
		case 38:
			// up key pressed
      player.makeMove(Direction.Up);
      console.log("Up pressed, new pos: " + player.position.Tx + " " + player.position.Ty)
			break;
		case 39:
			// right key pressed
      player.makeMove(Direction.Right);
      console.log("Right pressed, new pos: " + player.position.Tx + " " + player.position.Ty)
			break;
		case 40:
			// down key pressed
      player.makeMove(Direction.Down);
      console.log("Down pressed, new pos: " + player.position.Tx + " " + player.position.Ty)
			break;
	}
}

function accountForDPI(canvas:HTMLCanvasElement) {
  // Get device pixel ratio
  const dpr = window.devicePixelRatio || 1;

  // Get the canvas size from CSS
  const rect = canvas.getBoundingClientRect();

  // Set the canvas internal dimensions to match DPI
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale all canvas operations to account for DPI
  ctx!.scale(dpr, dpr);

  // Reset the canvas display size
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
}

async function createRoom(room = null) {
  let responseData;
  if(room == null){
    let response = await fetch(`https://${SERVER_URL}/room/create`, {
      method: "POST",
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      return;
    }

    responseData = await response.text(); // Assuming the API returns a string
    console.log(responseData);

    const room_code_val = <HTMLElement>document.querySelector("#roomcode");

    navigator.clipboard.writeText(responseData);

    room_code_val.innerHTML = `<div>${responseData}</div>`
  }else{
    responseData = room;
    console.log("joining: " + responseData);
  }


  const socket = new WebSocket(`wss://${SERVER_URL}/websocket?room=${responseData}`);

  socket.onopen = function() {
    console.log("WebSocket connection established.");
    // Request maze data once connection is established
    if (socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket connection established.");
    }
  };

  socket.onmessage = function(event) {
    const messageData = JSON.parse(event.data);
    console.log("RECEIVED MESSAGE", messageData);
    if(messageData.hasOwnProperty("wallH")){
      data = messageData;
      prevValidPos = {x: data.startX, y: data.startY};
      // Initialize player after receiving maze data
      thickGrid = getThickWalledMaze(data)
      extraTiles = thickGrid.length - 2
      landTileTypeArray = generateRandomTileTypes(thickGrid.length, extraTiles, 7);
      treeTileTypeArray = generateRandomTileTypes(thickGrid.length, extraTiles, 20);
      initializeGame();
    }
    if(messageData == "START_GAME"){

      canvas.hidden = false;
      waitingMessage.hidden = true;
      initialOptions.hidden = true;
      joinForm.hidden = true;
      errorMessage.hidden = true;
      sendMessage({ statusMessage: "GET_MAZE_NEW_LEVEL" });
    }
    if(messageData == "UPDATE_MAZE_LEVEL"){
      gameInitialized = false;
      setTimeout(function() {
        sendMessage({ statusMessage: "GET_MAZE_NEW_LEVEL"});
        console.log("Received message:", messageData);
      }, 100);
    }
    if(messageData == "RESET_MAZE"){
      gameInitialized = false;
      setTimeout(function() {
        sendMessage({ statusMessage: "GET_MAZE_SAME_LEVEL"});
        console.log("Received message:", messageData);
      }, 100);
    }
    if(messageData == "INVALID_MOVE"){
      console.log("Invalid Move");
    }
    if(messageData == "GAME_OVER_WIN" || messageData == "GAME_OVER_LOSS"){
      canMove = false;

      ui.hidden = false;
      const resultDiv = <HTMLElement>document.querySelector("#result-text");
      const result = <HTMLElement>document.querySelector("#result");
      result.hidden = false;
      if(messageData == "GAME_OVER_LOSS"){
        resultDiv.innerHTML = "<h1 style='color: red'>YOU LOST!</h1>"
      }else{
        resultDiv.innerHTML = "<h1 style='color: green'>YOU WON!</h1>"
      }
    }

  };

  socket.onerror = function(error) {
    console.error("WebSocket error: ", error);
  };

  socket.onclose = function(event) {
    console.log("WebSocket connection closed:", event);
    if (!gameInitialized) {
      waitingMessage.hidden = true;
      errorText.textContent = event.reason || "Connection failed. Please check the room code.";
      errorMessage.hidden = false;
    }
  };
  return socket;
}

function initializeGame() {
  ui.hidden = true;
  document.querySelector<HTMLElement>('.title-imgs')!.style.display = 'none';
  document.querySelector<HTMLElement>('.game-title')!.style.display = 'none';
  if (!gameInitialized && data) {

    // Calculate the center of the thickGrid
    const gridCenter = {
      x: (thickGrid.length -1) / 2,
      y: (thickGrid.length -1) / 2
    };

    const screenCenter = map_to_screen(gridCenter);

    const minGridX = 0;
    const maxGridX = thickGrid.length - 1;
    const minGridY = 0;
    const maxGridY = thickGrid.length - 1;

    const corners = [
      { x: minGridX, y: minGridY },
      { x: maxGridX, y: minGridY },
      { x: minGridX, y: maxGridY },
      { x: maxGridX, y: maxGridY },
    ];

    const worldCorners = corners.map(c => map_to_screen(c));
    const minWorldX = Math.min(...worldCorners.map(c => c.x));
    const maxWorldX = Math.max(...worldCorners.map(c => c.x));
    const minWorldY = Math.min(...worldCorners.map(c => c.y));
    const maxWorldY = Math.max(...worldCorners.map(c => c.y));

    const worldWidth = maxWorldX - minWorldX;
    const worldHeight = maxWorldY - minWorldY;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    const zoomWidth = canvasWidth / worldWidth;
    const zoomHeight = canvasHeight / worldHeight;
    const desiredZoom = Math.min(zoomWidth, zoomHeight) * (thickGrid.length == 9 ? 0.4 : thickGrid.length == 11 ? 0.47 : thickGrid.length == 13 ? 0.54 :  0.6);
    camera = new Camera(desiredZoom) ;

    camera.position = {
      x: screenCenter.x - (canvas.width / (2 * dpr * camera.zoom)) + TILE_WIDTH/2,
      y: screenCenter.y - (canvas.height / (2 * dpr * camera.zoom))
    };



    player = new Player(thinToThickCord({x: data.startX, y: data.startY}), 19, 6);
    gameInitialized = true;
    canvas.hidden = false;
    canMove = true;

    updateTileSizes(32);

    window.requestAnimationFrame(gameLoop);
    console.log("Game initialized with player at: ", data.startX, data.startY);
  }
}

function gameLoop(timeStamp: number): void {
  if (!data || !player) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  camera.applyTransform();

  drawMaze(data, thickGrid, camera);
  camera.resetTransform();

  window.requestAnimationFrame(gameLoop);
}

function drawMaze(data: MazeResponse, grid:Uint8Array, camera: Camera) {
  if (!data) return;
  const { endX, endY } = data;


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

    const center = {x: (grid.length-1)/2, y: (grid.length-1)/2};
    // draw maze
    for(let i = -extraTiles; i < grid.length +extraTiles; i++){
      for(let j = -extraTiles; j < grid.length +extraTiles; j++){

        let pos = map_to_screen({x: i, y: j});
        // if(i == grid.length+extraTiles-1 && j == grid.length+extraTiles-1){
        //   drawTile(pos, camera, "CORNER");
        // }else if(i == grid.length+extraTiles-1){
        //   drawTile(pos, camera, "RIGHT_EDGE");
        // }else if(j == grid.length+extraTiles-1){
        //   drawTile(pos, camera, "LEFT_EDGE");
        // }else if(){
        if(dist({x:i, y: j}, center) <= grid.length/2 + extraTiles/2){
          if(i > 0 && i < grid.length-1 && j > 0 && j < grid.length-1){
            drawTile(pos, camera, "LAND7");
          }else{
            drawTile(pos, camera, `LAND${landTileTypeArray[i+extraTiles][j+extraTiles]}`);
          }
        }
        // }
        if(i < 0 || j < 0 || i >= grid.length || j >= grid.length ){

          //dont draw blocking tree in front
          if((i > grid.length-1 && i < grid.length+2) != (j > grid.length-1 && j < grid.length+2)){
            continue;
          }

          if(dist({x:i, y: j}, center) <= grid.length/2 + extraTiles/2){
            drawTile(pos, camera, `TREE${treeTileTypeArray[i+extraTiles][j+extraTiles]}`);
          }
          continue;
        }

        if(i == 0 || j == 0 || i == grid.length-1 || j == grid.length-1 ){}

        // drawIsometricTile(pos, ctx, false, camera

        if(i == 2* (endX) + 1 && j == 2* (endY) + 1 && !isEqualCoordinates(thickToThinCord(player.position), {x:endX, y:endY})){
          // drawImpOnIsometricMaze(pos, ctx, camera);
          drawTower(pos, camera);
          continue;
        }

        // @ts-ignore
        if(grid[i][j] == 1){
          // drawIsometricTile(pos, ctx, true, camera)
          drawTile(pos, camera, "WALL");
        }

        if(isEqualCoordinates(thickToThinCord(player.position), thickToThinCord({Tx:i, Ty: j}))){
          player.draw()
        }
      }
    }
  }
}

function dist(pt1: Coordinate, pt2: Coordinate) {
  return Math.floor(Math.sqrt(Math.pow(pt1.x-pt2.x, 2) + Math.pow(pt1.y-pt2.y, 2))  );
}

type MazeResponse = {
  width: number;
  height: number;
  wallH: number[][];
  wallV: number[][];
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

type animationState = {
  name: string;
  sheetY: number,
  frames: number // redundant
}


const animationStates : animationState[] = [
  {
    name: "idle_up",
    sheetY:21,
    frames: 6
  },
  {
    name: "idle_down",
    sheetY:3,
    frames: 6
  },
  {
    name: "idle_left",
    sheetY:9,
    frames: 6
  },
  {
    name: "idle_right",
    sheetY:15,
    frames: 6
  },
  {
    name: "move_up",
    sheetY:22,
    frames: 6
  },
  {
    name: "move_down",
    sheetY:4,
    frames: 6
  },
  {
    name: "move_left",
    sheetY:10,
    frames: 6
  },
  {
    name: "move_right",
    sheetY:16,
    frames: 6
  },
];


const TileType = {
  "LAND0": {x: 0, y: 0},
  "LAND1": {x: 1, y: 0},
  "LAND2": {x: 2, y: 0},
  "LAND3": {x: 3, y: 0},
  "LAND4": {x: 4, y: 0},
  "LAND5": {x: 5, y: 0},
  "LAND6": {x: 6, y: 0},
  "LAND7": {x: 7, y: 0},
  "LEFT_EDGE": {x: 0, y: 1},
  "RIGHT_EDGE": {x: 1, y: 1},
  "CORNER": {x: 2, y: 1},
  // "LEFT_WALL": {x: 2, y: 2},
  // "RIGHT_WALL": {x: 4, y: 2},
  "WALL": {x: 4, y: 3},
  "TREE0": {x: 0, y: 4},
  "TREE1": {x: 1, y: 4},
  "TREE2": {x: 2, y: 4},
  "TREE3": {x: 3, y: 4},
  "TREE4": {x: 4, y: 4},
  "TREE_EMPTY": {x: 5, y: 4},
};

type Coordinate = {
  x: number;
  y: number;
};

type ThickCoordinate = {
  Tx: number;
  Ty: number;
}

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

function fetchExitInfo(thickMaze: Uint8Array, curr: ThickCoordinate){
  // console.log(thickMaze)
  const currX = curr.Tx;
  const currY = curr.Ty;
  const exits = new Array<ThickCoordinate>();

  // @ts-ignore
  if(currX < thickMaze.length && thickMaze[currX+1][currY] == 0){
    exits.push({Tx: currX+1, Ty: currY});
  }
  // @ts-ignore
  if(currY < thickMaze.length && thickMaze[currX][currY+1] == 0){
    exits.push({Tx: currX, Ty: currY+1});
  }
  // @ts-ignore
  if(currX-1 > 0 && thickMaze[currX-1][currY] == 0){
    exits.push({Tx: currX-1, Ty: currY});
  }
  // @ts-ignore
  if(currY-1 > 0 && thickMaze[currX][currY-1] == 0){
    exits.push({Tx: currX, Ty: currY-1});
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


function removeItem<T>(arr: Array<T>, value: T, compareFn: (a: T, b: T) => boolean): Array<T> {
  const index = arr.findIndex(item => compareFn(item, value));
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function isEqualCoordinates(a: Coordinate, b: Coordinate): boolean{
  return a.x == b.x && a.y == b.y;
}

function sendMessage(message : any) {
      if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(message));
          console.log("Message Sent: " + JSON.stringify(message));
      } else {
          console.error("WebSocket connection is not open. but why ? ");
      }
}

function updateTileSizes(num:number){
  TILE_WIDTH = num;
  TILE_WIDTH_HALF = TILE_WIDTH/2;
  TILE_HEIGHT = TILE_WIDTH / 2;
  TILE_HEIGHT_HALF = TILE_HEIGHT / 2;
}

function map_to_screen(map: Coordinate): Coordinate {
  let screen: Coordinate = {x:0, y:0};
  screen.x = (map.x - map.y) * TILE_WIDTH_HALF ;
  screen.y = (map.x + map.y) * TILE_HEIGHT_HALF ;
  return screen;
}

function drawIsometricTile(isoOrigin: Coordinate, ctx: CanvasRenderingContext2D, isBlock = false, camera : Camera) {
  let blockHeight = isBlock ? TILE_HEIGHT_HALF * 1.7: TILE_HEIGHT_HALF * 0.3;
  isoOrigin = isBlock ? moveFromOrigin(isoOrigin, {x: 0, y: -1 * blockHeight}) :  isoOrigin;

  //top
  let tileLeft = moveFromOrigin(isoOrigin, {x: -TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF});
  let tileRight = moveFromOrigin(isoOrigin, {x: TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF});
  let tileBottom = moveFromOrigin(isoOrigin, {x: 0, y: TILE_HEIGHT});
  let cubeBottom = moveFromOrigin(isoOrigin, {x: 0, y: TILE_HEIGHT + blockHeight});
  let cubeLeft = moveFromOrigin(isoOrigin, {x: -TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF/2});
  let cubeRight = moveFromOrigin(isoOrigin, {x: TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF/2});

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

function drawImpOnIsometricMaze(isoOrigin: Coordinate, ctx: CanvasRenderingContext2D, camera: Camera, isStart=false) {
  const wobble = (Math.sin(Date.now() / 250) + 1) * (isStart ? 0: 5); // Adjust amplitude as needed
  isoOrigin = { ...isoOrigin, y: isoOrigin.y - wobble - (isStart ? TILE_HEIGHT : TILE_HEIGHT_HALF * 1.7) };

  const blockHeight =  TILE_HEIGHT;

  // Calculate cube points
  const tileLeft = moveFromOrigin(isoOrigin, { x: -TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF });
  const tileRight = moveFromOrigin(isoOrigin, { x: TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF });
  const tileBottom = moveFromOrigin(isoOrigin, { x: 0, y: TILE_HEIGHT });
  const cubeBottom = moveFromOrigin(isoOrigin, { x: 0, y: TILE_HEIGHT + blockHeight });
  const cubeLeft = moveFromOrigin(isoOrigin, { x: -TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF / 2 });
  const cubeRight = moveFromOrigin(isoOrigin, { x: TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF / 2 });

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
  ctx.fillStyle =isStart ? "#00e000aa" :  '#e60d00cc'; // Left color with transparency
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

function moveFromOrigin(isoOrigin: Coordinate, cord: Coordinate){
  return {x: isoOrigin.x + cord.x, y: isoOrigin.y + cord.y};
}

function getThickWalledMaze(maze : MazeResponse){
  const { width, height, wallH, wallV } = maze;
  const dimWidth = 2*width + 1;
  const dimHeight = 2*height + 1;
  const grid = new Array(dimWidth).fill(0).map(() => new Uint8Array(dimHeight));
  for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Draw horizontal walls (when wallH is 1)
        if (wallH[x][y] == 1) {

          // @ts-ignore
          grid[2*x + 1][2*(y+1)] = 1;
        }
        // Draw vertical walls (when wallV is 1)
        if (wallV[x][y] == 1) {
          // @ts-ignore
          grid[2*(x + 1)][2*y+1] = 1;
        }
        // @ts-ignore
        grid[2*x][2*y] = 1;
      }
    }
  for(let x = 0; x < dimWidth; x++) {
    for (let y = 0; y < dimHeight; y++) {
      if(x == 0 || y == 0 || x == dimWidth-1 || y == dimHeight-1){
        // @ts-ignore
        grid[x][y] = 1;
      }
    }
  }
  // console.log(grid);
  return grid;
}

class Player {
  position: ThickCoordinate;
  x!: number;
  y!: number;
  v: number;
  screenX!: number;
  screenY!: number;
  radius: any;
  playerState: string;
  gameFrame: number;
  staggerFrames: number;
  spriteAnimations: any[string] = [];
  mageImgWidth: number;
  mageImgHeight: number;
  futurePos!: Coordinate[];
  constructor (position: ThickCoordinate, v: number, radius:number){
    this.position = position;
    this.v = v;
    this.radius = radius;

    this.playerState = "idle_right"
    this.gameFrame = 0;
    this.staggerFrames = 4

    this.mageImgWidth = 32
    this.mageImgHeight = 48

    this.futurePos = [];


    animationStates.forEach((state, index) => {
      let frames :any = {
        loc: []
      };

      for (let i = 0; i < state.frames; i++) {
        let positionX = i * this.mageImgWidth;
        let positionY = state.sheetY * this.mageImgHeight;
        frames.loc.push({ x: positionX, y: positionY });
      }

      this.spriteAnimations[state.name] = frames;
    });
    console.log(this.spriteAnimations)

  }

  draw(){
    // Animation logic
    const maxFrame = this.spriteAnimations[this.playerState].loc.length;
    const position = Math.floor(this.gameFrame / this.staggerFrames) % maxFrame;
    let frameX = this.mageImgWidth * position;
    let frameY = this.spriteAnimations[this.playerState].loc[position].y;

    if(!canMove && this.futurePos.length > 0){
      // We're in the middle of an animation
      let screenCord = this.futurePos[0];

      // Apply the same offset as you do for the standing position
      screenCord = moveFromOrigin(screenCord, {x: 0, y: -TILE_HEIGHT-18});

      ctx.drawImage(mageTiles, frameX, frameY, this.mageImgWidth, this.mageImgHeight,
          screenCord.x, screenCord.y, this.mageImgWidth, this.mageImgHeight );

      this.gameFrame++;
      this.futurePos.shift();

      if(this.futurePos.length == 0){
        canMove = true;
        // Set the player state back to idle once animation is complete
        this.playerState = this.playerState.replace('move_', 'idle_');
      }
    } else {
      // Normal rendering when not moving
      // @ts-ignore
      let screenCord = map_to_screen({x: this.position.Tx, y: this.position.Ty});

      // Apply the offset
      screenCord = moveFromOrigin(screenCord, {x: 0, y: -TILE_HEIGHT-18});

      ctx.drawImage(mageTiles, frameX, frameY, this.mageImgWidth, this.mageImgHeight,
          screenCord.x, screenCord.y, this.mageImgWidth, this.mageImgHeight);

      this.gameFrame++;

      // When not moving, revert to idle state
      if (canMove && this.playerState.includes('move_')) {
        this.playerState = this.playerState.replace('move_', 'idle_');
      }
    }
  }

  makeMove(direction: Direction){
    if(!canMove || isEqualCoordinates(thickToThinCord(this.position), {x: data.endX, y: data.endY})){
      return;
    }
    const curr = this.position;
    const exits = fetchExitInfo(thickGrid, curr);
    let dx =0, dy = 0;
    let new_state: string;
    switch (direction){
      case Direction.Down:
        dy = 1;
        new_state = "move_down"
        break
      case Direction.Up:
        dy = -1
        new_state = "move_up"
        break
      case Direction.Left:
        dx = -1
        new_state = "move_left"
        break
      case Direction.Right:
        dx = 1
        new_state = "move_right"
        break
    }
    const next = {Tx: curr.Tx + dx, Ty: curr.Ty + dy};
    if (exits.find(e => e.Tx == next.Tx && e.Ty == next.Ty)) {
      // Set player state before movement
      this.playerState = new_state;

      // Disable movement during animation
      canMove = false;

      // Record when we reach a valid position (junction)
      if(next.Tx % 2 == 1 && next.Ty % 2 == 1){
        sendMessage({from: prevValidPos, to: thickToThinCord(next)})
        prevValidPos = thickToThinCord(next);
      }

      this.futurePos = [];

      const oldScreen = map_to_screen({x: curr.Tx, y: curr.Ty});
      const newScreen = map_to_screen({x: next.Tx, y: next.Ty});

      const changeX = newScreen.x - oldScreen.x;
      const changeY = newScreen.y - oldScreen.y;

      const minFrames = 12; // Minimum frames to show movement visibly

      const stepX = changeX / minFrames;
      const stepY = changeY / minFrames;

      let x = oldScreen.x;
      let y = oldScreen.y;

      for (let i = 0; i < minFrames; i++) {
        this.futurePos.push({x, y});
        x += stepX;
        y += stepY;
      }

      this.futurePos.push({x: newScreen.x, y: newScreen.y});


      // Actually update the player's position only after creating animation frames
      this.moveTo(next);
    }
  }

  moveTo(next: ThickCoordinate) {
    this.position = next;
  }
}


class Camera{
  position: Coordinate;
  zoom:number;
  rotate:number;

  constructor( initialScale : number) {
    this.position = {x: 0, y: 0};
    this.zoom = initialScale;
    this.rotate = 0;
  }

  applyTransform() {
    ctx.save();
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.position.x,- this.position.y);
  }

  resetTransform() {
    ctx.restore();
  }
}

function mousedown(event: MouseEvent) {
  if (!isDown) {
    mousePosStartX = event.pageX ;
    mousePosStartY = event.pageY ;
    isDown = true;
    event.preventDefault();
  }
}

function mousemove(event: MouseEvent) {
  if (isDown) {
    mousePosEndX = event.pageX;
    mousePosEndY = event.pageY;

    // Use a smaller factor for smoother camera movement
    const movementFactor = 3;
    let changeX = (mousePosStartX - mousePosEndX) * TILE_WIDTH_HALF * data.width / canvas.width * movementFactor;
    let changeY = (mousePosStartY - mousePosEndY) * TILE_HEIGHT_HALF * data.height / canvas.height * movementFactor;

    camera.position = moveFromOrigin(camera.position, {x: changeX, y: changeY});

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


function mousewheel(event: WheelEvent) {
  event.preventDefault();

  const delta = Math.sign(event.deltaY);

  const zoomFactor = 0.01;
  if (delta < 0) {
    camera.zoom = Math.min(2, camera.zoom + zoomFactor);
  } else {
    // Zoom in
    camera.zoom = Math.max(0.5, camera.zoom - zoomFactor);
  }
  // console.log(camera)
}

function thinToThickCord(cord: Coordinate): ThickCoordinate {
  return {Tx: 2*cord.x+1, Ty: 2*cord.y+1};
}

function thickToThinCord(tCord: ThickCoordinate){
  return {x: (tCord.Tx-1)/2, y: (tCord.Ty-1)/2}
}

function drawTile(screenCord: Coordinate, camera: Camera, tileType: String ){
 const tsize = TILE_WIDTH;
 // @ts-ignore
 const tilePosCord = TileType[tileType];

  if(tileType.startsWith("WALL") ) {
    screenCord = moveFromOrigin(screenCord, {x: 0, y: -TILE_HEIGHT});
  }

  if(tileType.startsWith("TREE") && +tileType.replace("TREE", "") > 4){
    return;
  }
  if(tileType.startsWith("TREE")) {
    screenCord = moveFromOrigin(screenCord, {x: 0, y: -4 * TILE_HEIGHT});
    ctx?.drawImage(tileAtlas,(tilePosCord.x) * tsize, (tilePosCord.y) * tsize, tsize, 3*tsize, screenCord.x, screenCord.y , tsize, 3*tsize);
  }else{
    ctx?.drawImage(tileAtlas,(tilePosCord.x) * tsize, tilePosCord.y * tsize, tsize, tsize, screenCord.x, screenCord.y, tsize, tsize);
  }
}


function generateRandomTileTypes(gridSize: number, extraTiles: number, maxValue = 7) {
  const totalSize = gridSize + 2 * extraTiles;

  return Array.from({length: totalSize}, () =>
      Array.from({length: totalSize}, () =>
          Math.floor(Math.random() * maxValue)
      )
  );
}

function drawTower(screenCord: Coordinate, camera: Camera){

  const towerImgWidth = 64;
  const towerImgHeight = 96;

  //adjust offset and also get the tower to center
  screenCord = moveFromOrigin(screenCord, {x: 0, y: -towerImgHeight/2 +towerImgHeight /8 });
  ctx?.drawImage(towerTiles,2* towerImgWidth,0, towerImgWidth, towerImgHeight, screenCord.x, screenCord.y , towerImgWidth/2 , towerImgHeight/2 );
}



/// BACKGROUNDS
function loadBackground() {

  //Helpers
  function lineToAngle(x1: number, y1: number, length: number, radians: number) {
    var x2 = x1 + length * Math.cos(radians),
        y2 = y1 + length * Math.sin(radians);
    return { x: x2, y: y2 };
  }

  function randomRange(min: number, max: number) {
    return min + Math.random() * (max - min);
  }

  function degreesToRads(degrees: number) {
    return degrees / 180 * Math.PI;
  }

  //Particle
  var particle = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,

    create: function(x: number, y: number, speed: number, direction: number) {
      var obj = Object.create(this);
      obj.x = x;
      obj.y = y;
      obj.vx = Math.cos(direction) * speed;
      obj.vy = Math.sin(direction) * speed;
      return obj;
    },

    getSpeed: function() {
      return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    },

    setSpeed: function(speed:any) {
      var heading = this.getHeading();
      this.vx = Math.cos(heading) * speed;
      this.vy = Math.sin(heading) * speed;
    },

    getHeading: function() {
      return Math.atan2(this.vy, this.vx);
    },

    setHeading: function(heading: any) {
      var speed = this.getSpeed();
      this.vx = Math.cos(heading) * speed;
      this.vy = Math.sin(heading) * speed;
    },

    update: function() {
      this.x += this.vx;
      this.y += this.vy;
    }
  };

  //Canvas and settings
  var canvasB = <HTMLCanvasElement>document.getElementById("background-canvas"),
      context = <CanvasRenderingContext2D>canvasB.getContext("2d"),
      width = canvasB.width = window.innerWidth,
      height = canvasB.height = window.innerHeight,
      stars:any[] = [],
      shootingStars: any[] = [],
      layers = [
        { speed: 0.015, scale: 0.2, count: 200 },
        { speed: 0.03, scale: 0.5, count: 50 },
        { speed: 0.05, scale: 0.75, count: 30 }
      ],
      starsAngle = 145,
      shootingStarSpeed = {
        min: 15,
        max: 20
      },
      shootingStarOpacityDelta = 0.01,
      trailLengthDelta = 0.01,
      shootingStarEmittingInterval = 2000,
      shootingStarLifeTime = 500,
      maxTrailLength = 300,
      starBaseRadius = 2,
      shootingStarRadius = 3,
      paused = false;

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

  function killShootingStar(shootingStar: any) {
    setTimeout(function() {
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
      for (i = shootingStars.length -1; i >= 0 ; i--){
        if (shootingStars[i].isDead){
          shootingStars.splice(i, 1);
        }
      }
    }
    requestAnimationFrame(update);
  }

  function drawStar(star: any) {
    context.fillStyle = "rgb(255, 221, 157)";
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
    context.fill();
  }

  function drawShootingStar(p:any) {
    var x = p.x,
        y = p.y,
        currentTrailLength = (maxTrailLength * p.trailLengthDelta),
        pos = lineToAngle(x, y, -currentTrailLength, p.getHeading());

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
  setInterval(function() {
    if (paused) return;
    createShootingStar();
  }, shootingStarEmittingInterval);

  window.onfocus = function () {
    paused = false;
  };

  window.onblur = function () {
    paused = true;
  };
}