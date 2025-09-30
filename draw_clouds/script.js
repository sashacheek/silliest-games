let currentCloudImage = null;
let currentDrawWidth = 0;
let currentDrawHeight = 0;
let currentOffsetX = 0;
let currentOffsetY = 0;
let currentColor = "";

const undoStack = [];

const canvas = document.getElementById("cloud-canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const ctx = canvas.getContext("2d");

let clouds;
let colors;

fetch("clouds.json")
  .then(response => response.json())
  .then(data => {
    colors = data.colors;

    for (const color of colors) {
    const col = document.getElementById(color);
    col.style.backgroundColor = color;
    col.addEventListener("click", () => {
      const prevColor = document.getElementById(currentColor);
      if (prevColor) {
        prevColor.style.border = "0px";
      }
      ctx.strokeStyle = color;
      col.style.border = "2px solid black";
      if (color == "black") {
        col.style.border = "2px solid lightgrey";
      }
      currentColor = color;
  })}
});

ctx.strokeStyle = "black"; // line color
ctx.lineWidth = 5;         // thickness
ctx.lineCap = "round";     // makes ends smooth

// const red = document.getElementById("red")
// red.style.backgroundColor = "red";
// red.addEventListener("click", () => {
//   ctx.strokeStyle = "red";
// })

let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseleave", () => drawing = false);

let lastX = 0
let lastY = 0;

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  lastX = e.offsetX;
  lastY = e.offsetY;
});

const newCloud = document.getElementById("new-cloud");

newCloud.addEventListener("click", () => {
  loadCloud();
})

function loadCloud() {
  fetch("clouds.json")
  .then(response => response.json())
  .then(data => {
    const images = data.clouds; // 👈 use the "clouds" array
    const random = images[Math.floor(Math.random() * images.length)];
    const img = new Image();
    img.src = "clouds/" + random; // adjust path to where files are stored
    img.onload = () => {
      const canvasAspect = canvas.width / canvas.height;
      const imgAspect = img.width / img.height;

      if (imgAspect > canvasAspect) {
        currentDrawHeight = canvas.height;
        currentDrawWidth = img.width * (canvas.height / img.height);
        currentOffsetX = (canvas.width - currentDrawWidth) / 2;
        currentOffsetY = 0;
      } else {
        currentDrawWidth = canvas.width;
        currentDrawHeight = img.height * (canvas.width / img.width);
        currentOffsetX = 0;
        currentOffsetY = (canvas.height - currentDrawHeight) / 2;
      }

      currentCloudImage = img; // store the actual Image object
      ctx.drawImage(img, currentOffsetX, currentOffsetY, currentDrawWidth, currentDrawHeight);
    };
  });
}

loadCloud();

const clearBtn = document.getElementById("clear");

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (currentCloudImage) {
    ctx.drawImage(currentCloudImage, currentOffsetX, currentOffsetY, currentDrawWidth, currentDrawHeight);
  }
});

const undoBtn = document.getElementById("undo");

undoBtn.addEventListener("click", () => {
  if (undoStack.length > 0) {
    const previous = undoStack.pop();
    ctx.putImageData(previous, 0, 0);
  }
});

const download = document.getElementById("download");

download.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "cloud-drawing.png";         // filename
  link.href = canvas.toDataURL("image/png"); // get canvas as PNG
  link.click();
});