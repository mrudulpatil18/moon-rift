("use strict");


let data: MazeResponse;
let secondsPassed = 0,
    oldTimestamp = 0,
    fps: number;
let canvas: HTMLCanvasElement;
let player: Player
let camera: Camera;
let socket: WebSocket | undefined;
const s = 25; // cell size
let gameInitialized = false;
// const SERVER_URL = `mazerunner-ynnb.onrender.com`
const SERVER_URL = "localhost"

let TILE_WIDTH = 64;
let TILE_WIDTH_HALF = 32;
let TILE_HEIGHT = 32;
let TILE_HEIGHT_HALF = 16;

let isDown = false;
let mousePosStartX: number, mousePosStartY: number;
let mousePosEndX: number, mousePosEndY: number;
let SCREEN_X_OFFSET, SCREEN_Y_OFFSET;

window.addEventListener('mousedown', mousedown)
window.addEventListener('mousemove', mousemove)
window.addEventListener('mouseup', mouseup)
window.addEventListener('resize', resizeCanvas);
window.addEventListener('wheel', mousewheel);

window.addEventListener("keydown", moveSomething, false);
window.onload = startRunner;

async function startRunner() {
  canvas = <HTMLCanvasElement>document.getElementById("canvas");


  accountForDPI(canvas);
  socket = await createRoom();
  console.log(socket);
}

function resizeCanvas() {
  const ctx = canvas.getContext('2d');
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
}

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
    camera = new Camera(canvas.getContext("2d")!);
    gameInitialized = true;
    window.requestAnimationFrame(gameLoop);
    console.log("Game initialized with player at: ", data.startX, data.startY);
  }
}

function gameLoop(timeStamp: number): void {
  if (!data || !player) return;

  player.context.clearRect(0, 0, canvas.width, canvas.height)
  camera.applyTransform();

  const thickGrid = getThickWalledMaze(data)
  drawMaze(data, thickGrid, camera);
  player.draw()

  camera.resetTransform();

  showFps(timeStamp);
  window.requestAnimationFrame(gameLoop);
}

function drawMaze(data: MazeResponse, grid:number[][], camera: Camera) {
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

    updateTileSizes(50);
    // draw maze
    for(let i = 0; i < grid.length; i++){
      for(let j = 0; j < grid.length; j++){
        let pos = map_to_screen({x: i, y: j});
        drawIsometricTile(pos, ctx, false, camera)
        if(i == 2* (endX) + 1 && j == 2* (endY) + 1){
          console.log("YES")
          drawEndOnIsometricMaze(pos, ctx, camera);
          continue;
        }

        if(i == 0 || j == 0 || i == grid.length-1 || j == grid.length-1 || grid[i][j] == 1){
          drawIsometricTile(pos, ctx, true, camera)
        }
      }
    }
  }
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

function findNextPath( maze: MazeResponse, curr: Coordinate, prev = { x: -1, y: -1 }): Array<Coordinate> {
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

function fetchExitInfo(maze: MazeResponse, curr: Coordinate): Array<Coordinate> {
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

function map_to_screen(map: Coordinate): Coordinate {
  SCREEN_X_OFFSET = canvas.width / (4 * camera.zoom);
  SCREEN_Y_OFFSET = 2* TILE_HEIGHT ;

  let screen: Coordinate = {x:0, y:0};
  screen.x = (map.x - map.y) * TILE_WIDTH_HALF +SCREEN_X_OFFSET ;
  screen.y = (map.x + map.y) * TILE_HEIGHT_HALF + SCREEN_Y_OFFSET;
  return screen;
}

function applyCamera(map: Coordinate, camera:Camera) {
  return{x: map.x - camera.position.x, y: map.y - camera.position.y};
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

  //apply camera effect
  isoOrigin = applyCamera(isoOrigin, camera);
  tileRight = applyCamera(tileRight, camera);
  tileLeft = applyCamera(tileLeft, camera);
  tileBottom = applyCamera(tileBottom, camera);
  cubeBottom = applyCamera(cubeBottom, camera);
  cubeRight = applyCamera(cubeRight, camera);
  cubeLeft = applyCamera(cubeLeft, camera);


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

function drawEndOnIsometricMaze(isoOrigin: Coordinate, ctx: CanvasRenderingContext2D, camera: Camera) {
  const wobble = (Math.sin(Date.now() / 250) + 1) * 5; // Adjust amplitude as needed
  isoOrigin = { ...isoOrigin, y: isoOrigin.y - wobble - TILE_HEIGHT_HALF * 1.7 };

  const blockHeight = TILE_HEIGHT;

  // Apply camera transformation
  isoOrigin = applyCamera(isoOrigin, camera);

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
  ctx.fillStyle = '#ff5933cc'; // Top color with transparency
  ctx.fill();

  // Draw left face
  ctx.beginPath();
  ctx.moveTo(tileLeft.x, tileLeft.y);
  ctx.lineTo(cubeLeft.x, cubeLeft.y);
  ctx.lineTo(cubeBottom.x, cubeBottom.y);
  ctx.lineTo(tileBottom.x, tileBottom.y);
  ctx.closePath();
  ctx.fillStyle = '#e60d00cc'; // Left color with transparency
  ctx.fill();

  // Draw right face
  ctx.beginPath();
  ctx.moveTo(tileRight.x, tileRight.y);
  ctx.lineTo(cubeRight.x, cubeRight.y);
  ctx.lineTo(cubeBottom.x, cubeBottom.y);
  ctx.lineTo(tileBottom.x, tileBottom.y);
  ctx.closePath();
  ctx.fillStyle = '#ff401acc'; // Right color with transparency
  ctx.fill();
}

function moveFromOrigin(isoOrigin: Coordinate, cord: Coordinate){
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
  // console.log(grid);
  return grid;
}

class Player {
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

class Camera{
  context: CanvasRenderingContext2D;
  position: Coordinate;
  zoom:number;
  rotate:number;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
    this.position = {x: 0, y: 0};
    this.zoom = 1;
    this.rotate = 0;
  }

  applyTransform() {
    this.context.save();
    this.context.scale(this.zoom, this.zoom);
  }

  resetTransform() {
    this.context.restore();
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

function mouseup(event : MouseEvent) {
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
