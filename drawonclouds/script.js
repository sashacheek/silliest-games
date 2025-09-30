let currentCloudImage = null;
let currentDrawWidth = 0;
let currentDrawHeight = 0;
let currentOffsetX = 0;
let currentOffsetY = 0;
let currentColor = "";

let drawing = false;
let erasing = false;

let baseCloudData = null;

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
      const prevColor = currentColor;
      if (prevColor) {
        prevColor.style.border = "0px";
      }
      ctx.strokeStyle = color;
      col.style.border = "2px solid black";
      if (color == "black") {
        col.style.border = "2px solid lightgrey";
      }
      currentColor = col;
      erasing = false;
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
if (erasing && currentCloudImage) {
  const brushSize = 50; // circle diameter
  ctx.save();
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, brushSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    currentCloudImage,
    currentOffsetX,
    currentOffsetY,
    currentDrawWidth,
    currentDrawHeight
  );
  ctx.restore();
} else {
  ctx.stroke();
}


  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault(); // stop scrolling
  const touch = e.touches[0];
  drawing = true;
  lastX = touch.clientX - canvas.getBoundingClientRect().left;
  lastY = touch.clientY - canvas.getBoundingClientRect().top;
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!drawing) return;
  const touch = e.touches[0];
  const x = touch.clientX - canvas.getBoundingClientRect().left;
  const y = touch.clientY - canvas.getBoundingClientRect().top;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
if (erasing && currentCloudImage) {
  const brushSize = 50; // circle diameter
  ctx.save();
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, brushSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    currentCloudImage,
    currentOffsetX,
    currentOffsetY,
    currentDrawWidth,
    currentDrawHeight
  );
  ctx.restore();
} else {
  ctx.stroke();
}


  lastX = x;
  lastY = y;
});

canvas.addEventListener("touchend", () => drawing = false);
canvas.addEventListener("touchcancel", () => drawing = false);

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

  currentCloudImage = img;
  ctx.drawImage(img, currentOffsetX, currentOffsetY, currentDrawWidth, currentDrawHeight);

  // ✅ save snapshot AFTER the cloud is drawn
  baseCloudData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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

const eraser = document.getElementById("eraser");

eraser.addEventListener("click", () => {
  erasing = true;
});

const tool = document.getElementById("tools");
const tools = tool.children;
for (let i = 0; i < tools.length; i++) {
  const option = tools[i];
  option.addEventListener("click", () => {
      const prevColor = currentColor;
      if (prevColor) {
        prevColor.style.border = "0px";
      }
      option.style.border = "2px solid black";
      currentColor = option;
  })
}