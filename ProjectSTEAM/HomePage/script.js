let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let video = document.createElement('video');
video.width = canvas.width;
video.height = canvas.height;
video.autoplay = true;

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then(stream => {
    video.srcObject = stream;
}).catch(error => {
    console.error('Error accessing the webcam: ', error);
});

video.addEventListener('loadeddata', () => {
    detectFrame();
});

async function detectFrame() {
    let model;
    try {
        model = await cocoSsd.load();
    } catch (error) {
        console.error('Error loading the COCO-SSD model: ', error);
        return;
    }

    requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        model.detect(video).then(predictions => {
            predictions.forEach(prediction => {
                if (prediction.score > 0.5) {
                    drawBoundingBox(prediction);
                    drawLabel(prediction);
                    playAudio();
                }
            });

            detectFrame(); // Continue detecting frames
        });
    });
}

function drawBoundingBox(prediction) {
    ctx.beginPath();
    ctx.rect(...prediction.bbox);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'yellow';
    ctx.stroke();
    ctx.closePath();
}

function drawLabel(prediction) {
    const text = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
    const x = prediction.bbox[0];
    const y = prediction.bbox[1] > 10 ? prediction.bbox[1] - 10 : 10;

    ctx.fillStyle = 'yellow';
    ctx.font = '18px Arial'; // Ensure font is set before fillText
    ctx.fillText(text, x, y);
}

function playAudio() {
    let audio = document.getElementById('audio');
    audio.play();
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 500);
}
