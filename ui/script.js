async function fetchMaze(dimension) {
    let response = await fetch(`http://localhost:8080/maze?dimension=${dimension}`, {
        method: "GET",
    });

    let data = await response.json();
    console.log(data);
    return data
}

function drawMaze(data) {
    console.log("Drawing starting")
    const { width, height, wallH, wallV, startX, startY, endX, endY } = data;

    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        const s = 25 ; // cell size
        
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw outer border
        ctx.beginPath();
        ctx.rect(s, s, s*width, s*height);
        ctx.stroke();
        
        // Draw walls
        ctx.strokeStyle = Math.random() > 0.5 ? "black" : "black"
        ctx.beginPath();
        for(let x = 0; x < width; x++){
            for(let y = 0; y < height; y++){
                // Draw horizontal walls (when wallH is 1)
                if(wallH[x][y] === 1){
                    ctx.moveTo(s + x*s, s + (y+1)*s);
                    ctx.lineTo(s + (x+1)*s, s + (y+1)*s);
                }
                
                // Draw vertical walls (when wallV is 1)
                if(wallV[x][y] === 1){
                    ctx.moveTo(s + (x+1)*s, s + y*s);
                    ctx.lineTo(s + (x+1)*s, s + (y+1)*s);
                }
            }
        }
        ctx.stroke();
        
        // Draw start and end points
        if (startX !== undefined && startY !== undefined) {
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(s + startX*s + s/2, s + startY*s + s/2, s/4, 0, 2*Math.PI);
            ctx.fill();
        }
        
        if (endX !== undefined && endY !== undefined) {
            ctx.fillStyle =  "red" ;
            ctx.beginPath();
            ctx.arc(s + endX*s + s/2, s + endY*s + s/2, s/4, 0, 2*Math.PI);
            ctx.fill();
        }
    }
}

window.onload = startRunner;

let data;
let secondsPassed, oldTimestamp=0, fps;
let canvas;

async function startRunner(){
    canvas = document.getElementById("canvas");
    data = await fetchMaze(20);
    window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {
    console.log(fps)
    drawMaze(data);

    showFps(timeStamp);
    window.requestAnimationFrame(gameLoop);
}

//show fps
function showFps(timeStamp){
    secondsPassed = (timeStamp-oldTimestamp)/1000;
    oldTimestamp = timeStamp;
    fps = 1/secondsPassed
    const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.font = "20px serif";
        ctx.fillText("FPS: " + fps.toFixed(1) , 200, 20);
}