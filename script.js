const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const filteredCanvas = document.getElementById('filteredCanvas');
const context = canvas.getContext('2d');
const filteredContext = filteredCanvas.getContext('2d');
const loadingIndicator = document.getElementById('loading');
let currentStream = null;
let isFrontCamera = true;
const SQUARE_SIZE = 640; // Set square dimensions

// Function to set video and canvas dimensions
function setDimensions() {
    video.width = SQUARE_SIZE;
    video.height = SQUARE_SIZE;
    canvas.width = SQUARE_SIZE;
    canvas.height = SQUARE_SIZE;
    filteredCanvas.width = SQUARE_SIZE;
    filteredCanvas.height = SQUARE_SIZE;
}

// Access the user's camera
function startCamera(facingMode = 'user') {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    loadingIndicator.style.display = 'block'; // Show loading indicator
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
            setDimensions(); // Set dimensions when starting the camera
        })
        .catch(err => {
            console.error("Error accessing camera: ", err);
            loadingIndicator.style.display = 'none'; // Hide loading indicator on error
        })
        .finally(() => {
            loadingIndicator.style.display = 'none'; // Hide loading indicator when done
        });
}

startCamera();

// Capture and apply pop-art effect
document.getElementById('capturePhoto').addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    applyPopArtEffect();
    document.getElementById('savePhoto').style.display = 'inline-block'; // Show save button
});

// Function to apply pop-art effect
function applyPopArtEffect() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple pop-art effect
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg < 128 ? 0 : 255;
        data[i + 1] = avg < 128 ? 0 : 255;
        data[i + 2] = avg < 128 ? 0 : 255;
    }

    filteredContext.putImageData(imageData, 0, 0);
}

// Save image to user's device
document.getElementById('savePhoto').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = filteredCanvas.toDataURL('image/png');
    link.download = 'SnapArtify_PopArtPhoto.png';
    link.click();
});

// Toggle camera between front and back
document.getElementById('toggleCamera').addEventListener('click', () => {
    isFrontCamera = !isFrontCamera;
    startCamera(isFrontCamera ? 'user' : 'environment');
});

// Event listener to handle window resizing
window.addEventListener('resize', setDimensions);


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
