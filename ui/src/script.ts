("use strict");

window.addEventListener("keydown", moveSomething, false);

function moveSomething(e: { keyCode: any; }) {
  if(player == null){
    return;
  }
	switch(e.keyCode) {
		case 37:
			// left key pressed
      player.makeMove(Direction.Left);
      console.log("Left pressed, new pos: " + player.position.x + " " + player.position.y)
			break;
		case 38:
			// up key pressed
      player.makeMove(Direction.Up);
      console.log("Up pressed, new pos: " + player.position.x + " " + player.position.y)
			break;
		case 39:
			// right key pressed
      player.makeMove(Direction.Right);
      console.log("Right pressed, new pos: " + player.position.x + " " + player.position.y)
			break;
		case 40:
			// down key pressed
      player.makeMove(Direction.Down);
      console.log("Down pressed, new pos: " + player.position.x + " " + player.position.y)
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
  canvas.getContext("2d")!.scale(dpr, dpr);

  // Reset the canvas display size
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
}

async function createRoom() {
  let response = await fetch(`http://${SERVER_URL}:8080/room/create`, {
    method: "POST",
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`);
    return;
  }

  let responseData = await response.text(); // Assuming the API returns a string
  console.log(responseData);

  const socket = new WebSocket(`ws://${SERVER_URL}:8080/websocket?room=${responseData}`);

  socket.onopen = function(event) {
    console.log("WebSocket connection established.");
    // Request maze data once connection is established
    if (socket.readyState === WebSocket.OPEN) {
      sendMessage({ statusMessage: "GET_MAZE_NEW_LEVEL"});
    }
  };

  socket.onmessage = function(event) {
    const messageData = JSON.parse(event.data);
    if(messageData.hasOwnProperty("wallH")){
      data = messageData;
      // Initialize player after receiving maze data
      initializeGame();
    }
    if(messageData == "UPDATE_MAZE_LEVEL"){
      sendMessage({ statusMessage: "GET_MAZE_NEW_LEVEL"});
    }
    console.log("Received message:", messageData);
  };


  socket.onerror = function(error) {
    console.error("WebSocket error: ", error);
  };

  socket.onclose = function(event) {
    console.log("WebSocket connection closed:", event);
  };
  return socket;
}

function initializeGame() {
  if (!gameInitialized && data) {
    player = new Player(canvas.getContext("2d")!, {x: data.startX, y: data.startY}, 19, 6);
    gameInitialized = true;
    window.requestAnimationFrame(gameLoop);
    console.log("Game initialized with player at: ", data.startX, data.startY);
  }
}

function drawMaze(data: MazeResponse, grid:number[][]) {
  if (!data) return;
  const { width, height, wallH, wallV, startX, startY, endX, endY } = data;


  if (canvas.getContext) {
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = Math.random() > 0.5 ? "white" : "white";
    // Draw outer border
    ctx.beginPath();
    ctx.rect(s, s, s * width, s * height);
    ctx.stroke();

    // Draw walls
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Draw horizontal walls (when wallH is 1)
        if (wallH[x][y] === 1) {
          ctx.moveTo(s + x * s, s + (y + 1) * s);
          ctx.lineTo(s + (x + 1) * s, s + (y + 1) * s);
        }

        // Draw vertical walls (when wallV is 1)
        if (wallV[x][y] === 1) {
          ctx.moveTo(s + (x + 1) * s, s + y * s);
          ctx.lineTo(s + (x + 1) * s, s + (y + 1) * s);
        }
      }
    }
    ctx.stroke();

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
    if (endX !== undefined && endY !== undefined) {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(
        s + endX * s + s / 2,
        s + endY * s + s / 2,
        s / 4,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    updateTileSizes(40);

    for(let i = 0; i < grid.length; i++){
      for(let j = 0; j < grid.length; j++){
        let pos = map_to_screen({x: i, y: j});
        drawIsometricTile(pos, ctx, false)
        if(i == 0 || j == 0 || i == grid.length-1 || j == grid.length-1){
          drawIsometricTile(pos, ctx, true)
        }
        if(grid[i][j] == 1){
          drawIsometricTile(pos, ctx, true)
          // ctx.fillText(`(${i},${j})`, pos.x - TILE_WIDTH_HALF /2,  pos.y   + TILE_HEIGHT / 2);
        }
      }
    }
  }
}

let data: MazeResponse;
let secondsPassed = 0,
  oldTimestamp = 0,
  fps: number;
let canvas: HTMLCanvasElement;
let player: Player
let socket: WebSocket | undefined;
const s = 25; // cell size
let gameInitialized = false;
// const SERVER_URL = `mazerunner-ynnb.onrender.com`
const SERVER_URL = "localhost"

let img = new Image();
img.src = './stone_W.png ';
let img2 = new Image();
img2.src = './stoneWall_E.png ';

const WIDTH = img.width;
const HEIGHT = img.height;

window.onload = startRunner;

async function startRunner() {
  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  const ctx = canvas.getContext('2d');
  window.addEventListener('resize', function() {
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
  });


  accountForDPI(canvas);
  socket = await createRoom();
  console.log(socket);
}

function gameLoop(timeStamp: number): void {
  // player.update(secondsPassed)
  if (!data || !player) return;
  player.context.clearRect(0, 0, canvas.width, canvas.height)
  const thickGrid = getThickWalledMaze(data)
  drawMaze(data, thickGrid);
  player.draw()
  showFps(timeStamp);
  window.requestAnimationFrame(gameLoop);
}


//show fps
function showFps(timeStamp: number): void {
  secondsPassed = (timeStamp - oldTimestamp) / 1000;
  oldTimestamp = timeStamp;
  fps = 1 / secondsPassed;
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
  ctx.fillStyle = "gray";
  ctx.font = "20px serif";
  ctx.fillText("FPS: " + fps.toFixed(0), 200, 20);
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

type Coordinate = {
  x: number;
  y: number;
};

function findNextPath(
  maze: MazeResponse,
  curr: Coordinate,
  prev = { x: -1, y: -1 }
): Array<Coordinate> {
  const path = [];
  while (true) {
    const currCellExits = fetchExitInfo(maze, curr);
    const filteredExits= removeItem(currCellExits, prev, isEqualCoordinates);
    if (filteredExits.length != 1) {
      break;
    }
    for (let cell of filteredExits) {
      prev = curr;
      curr = cell;
      path.push(curr);
    }
  }
  return path;
}

function fetchExitInfo(
  maze: MazeResponse,
  curr: Coordinate
): Array<Coordinate> {
  const { wallH, wallV } = maze;
  const currX = curr.x;
  const currY = curr.y;
  const exits = new Array<Coordinate>();
  if (wallH[currX][currY] == 0) {
    exits.push({ x: currX, y: currY + 1 });
  }
  if (currY > 0 && wallH[currX][currY - 1] == 0) {
    exits.push({ x: currX, y: currY - 1 });
  }
  if (wallV[currX][currY] == 0) {
    exits.push({ x: currX + 1, y: currY });
  }
  if (currX > 0 && wallV[currX - 1][currY] == 0) {
    exits.push({ x: currX - 1, y: currY });
  }
  return exits;
}

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

class Player
{
    context: CanvasRenderingContext2D;
    position: Coordinate;
    x!: number;
    y!: number;
    v: number;
    radius: any;
    constructor (context: CanvasRenderingContext2D, position: Coordinate, v: number, radius:number){
        this.context = context;
        this.position = position;
        this.v = v;
        this.radius = radius;
        this.updateXY()
    }

    draw(){
      this.context.fillStyle = "green";
      this.context.beginPath();
      this.context.arc(
        this.x,
        this.y,
        this.radius,
        0,
        2 * Math.PI
      );
      this.context.fill();
  }

  updateXY():void{
    this.x = s + this.position.x * s + s / 2;
    this.y = s + this.position.y * s + s / 2;
  }

  makeMove(direction: Direction){
    const curr = this.position;
    const exits = fetchExitInfo(data, curr);
    let dx =0, dy = 0;
    switch (direction){
      case Direction.Down:
        dy = 1
        break
      case Direction.Up:
        dy = -1
        break
      case Direction.Left:
        dx = -1
        break
      case Direction.Right:
        dx = 1
        break
    }
    const next = {x: curr.x + dx, y: curr.y + dy};
    if (exits.find(e => e.x == next.x && e.y == next.y)) {
      this.moveTo(next);
      socket?.send(JSON.stringify({from:curr, to:next}));
    //   const path = findNextPath(data, next, curr);
    //   if(path.length == 0){
    //     return
    //   }
    //   for(let pos of path){
    //     this.moveTo(pos);
    //   }
    }


  }
  moveTo(next: Coordinate) {
    this.position = next;
    this.updateXY();
  }

}

function sendMessage(message : any) {
      if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(message));
      } else {
          console.error("WebSocket connection is not open. but why ? ");
      }
}

function updateTileSizes(num:number){
  TILE_WIDTH = canvas.width/num;
  TILE_WIDTH_HALF = TILE_WIDTH/2;
  TILE_HEIGHT = TILE_WIDTH / 2;
  TILE_HEIGHT_HALF = TILE_HEIGHT / 2;
}

let TILE_WIDTH = 64;
let TILE_WIDTH_HALF = 32;
let TILE_HEIGHT = 32;
let TILE_HEIGHT_HALF = 16;


function map_to_screen(map: Coordinate): Coordinate {
  const SCREEN_OFFSET = canvas.width/4;
  const SCREEN_VERTICAL_OFFSET = TILE_HEIGHT * 2;
  let screen: Coordinate = {x:0, y:0};
  screen.x = (map.x - map.y) * TILE_WIDTH_HALF + SCREEN_OFFSET;
  screen.y = (map.x + map.y) * TILE_HEIGHT_HALF+ SCREEN_VERTICAL_OFFSET;
  return screen;
}


function drawIsometricTile(isoOrigin: Coordinate, ctx: CanvasRenderingContext2D, isBlock = false) {
  let blockHeight = isBlock ? TILE_HEIGHT_HALF * 1.7: TILE_HEIGHT_HALF * 0.3;
  isoOrigin = isBlock ? moveFromIsoOrigin(isoOrigin, {x: 0, y: -1 * blockHeight}) :  isoOrigin;
  //top
  let tileLeft = moveFromIsoOrigin(isoOrigin, {x: -TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF});
  let tileRight = moveFromIsoOrigin(isoOrigin, {x: TILE_WIDTH_HALF, y: TILE_HEIGHT_HALF});
  let tileBottom = moveFromIsoOrigin(isoOrigin, {x: 0, y: TILE_HEIGHT});
  let cubeBottom = moveFromIsoOrigin(isoOrigin, {x: 0, y: TILE_HEIGHT + blockHeight});
  let cubeLeft = moveFromIsoOrigin(isoOrigin, {x: -TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF/2});
  let cubeRight = moveFromIsoOrigin(isoOrigin, {x: TILE_WIDTH_HALF, y: TILE_HEIGHT + blockHeight - TILE_WIDTH_HALF/2});
  ctx.beginPath();
  ctx.moveTo(isoOrigin.x, isoOrigin.y);
  ctx.lineTo(tileLeft.x, tileLeft.y);
  ctx.lineTo(tileBottom.x, tileBottom.y);
  ctx.lineTo(tileRight.x, tileRight.y);
  ctx.closePath();
  ctx.fillStyle = isBlock ? "#fba52d" : "#232121";
  ctx.fill();

  if(true){

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

}

function moveFromIsoOrigin(isoOrigin: Coordinate, cord: Coordinate){
  return {x: isoOrigin.x + cord.x, y: isoOrigin.y + cord.y};
}

function getThickWalledMaze(maze : MazeResponse){
  const { width, height, wallH, wallV, startX, startY, endX, endY } = maze;
  const dimWidth = 2*width + 1;
  const dimHeight = 2*height + 1;
  const grid = Array.from(Array(dimHeight), () => new Array(dimWidth).fill(0));
  for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Draw horizontal walls (when wallH is 1)
        if (wallH[x][y] == 1) {
          grid[2*x + 1][2*(y+1)] = 1;
        }
        // Draw vertical walls (when wallV is 1)
        if (wallV[x][y] == 1) {
          grid[2*(x + 1)][2*y+1] = 1;
        }
        grid[2*x][2*y] = 1;
      }
    }
  console.log(grid);
  return grid;
}