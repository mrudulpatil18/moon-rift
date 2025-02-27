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

async function fetchMaze(dimension: number) {
  let response = await fetch(
    `http://localhost:8080/maze?dimension=${dimension}`,
    {
      method: "GET",
    }
  );

  let data = await response.json();
  console.log(data);
  return data;
}

function drawMaze(data: MazeResponse) {
  const { width, height, wallH, wallV, startX, startY, endX, endY } = data;

  if (canvas.getContext) {
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw outer border
    ctx.beginPath();
    ctx.rect(s, s, s * width, s * height);
    ctx.stroke();

    // Draw walls
    ctx.strokeStyle = Math.random() > 0.5 ? "black" : "black";
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
  }
}

window.onload = startRunner;

let data: MazeResponse;
let secondsPassed = 0,
  oldTimestamp = 0,
  fps: number;
let canvas: HTMLCanvasElement;
let player: Player
const s = 25; // cell size


async function startRunner() {
  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  accountForDPI(canvas)
  data = await fetchMaze(15);
  player = new Player(canvas.getContext("2d")!, {x:data.startX, y:data.startY}, 19, 6);
  window.requestAnimationFrame(gameLoop);
  console.log(findNextPath(data, { x: data.startX, y: data.startY }));
}

function gameLoop(timeStamp: number): void {
  // player.update(secondsPassed)
  player.context.clearRect(0, 0, canvas.width, canvas.height)
  drawMaze(data);
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
  ctx.fillStyle = "black";
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
  const path = new Array();
  while (true) {
    const currCellExits = fetchExitInfo(maze, curr);
    const filteredExits= removeItem(currCellExits, prev, isEqualCoordinates);
    if (currCellExits.length != 1) {
      break;
    }
    for (let cell of currCellExits) {
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
      this.moveTo(next)
      const path = findNextPath(data, next, curr);
      if(path.length == 0){
        return
      }
      for(let pos of path){
        this.moveTo(pos);
      }
    }
    
  }
  moveTo(next: Coordinate) {
    this.position = next;
    this.updateXY();
  }


  // update(secondsPassed: number){
  //     this.x += this.v * secondsPassed;
  //     this.y += this.v * secondsPassed;
  //     console.log("NEW x, y: ", this.x + " ", this.y)
  // }
}
