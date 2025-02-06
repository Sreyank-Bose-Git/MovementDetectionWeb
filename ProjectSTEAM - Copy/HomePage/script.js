let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let video = document.createElement('video');
video.width = canvas.width;
video.height = canvas.height;
video.autoplay = true;
video.crossOrigin = "anonymous";

const imageUrl = "https://th.bing.com/th/id/R.e38767b2d4005b865e1854c265e9ab7e?rik=26FggQ9EhPrG7Q&riu=http%3a%2f%2fwww.baltana.com%2ffiles%2fwallpapers-2%2fCute-Cat-Images-07756.jpg&ehk=BwZvi%2fA6o4aHac3M%2f%2bTD36S9IrJ6kmWhXYOsPzuV%2bzc%3d&risl=&pid=ImgRaw&r=0"; // New image URL from Unsplash

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then(stream => {
    video.srcObject = stream;
}).catch(error => {
    console.error('Error accessing the webcam: ', error);
    useFallbackImage();
});

video.addEventListener('loadeddata', () => {
    detectFrame();
});

async function detectFrame() {
    const model = await cocoSsd.load();
    requestAnimationFrame(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        model.detect(video).then(predictions => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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

function useFallbackImage() {
    let image = new Image();
    image.src = imageUrl;
    image.crossOrigin = "anonymous"; // Set crossOrigin attribute
    image.onload = async () => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const model = await cocoSsd.load();
        model.detect(image).then(predictions => {
            predictions.forEach(prediction => {
                if (prediction.score > 0.5) {
                    drawBoundingBox(prediction);
                    drawLabel(prediction);
                    playAudio();
                }
            });
        });
    };
}

function drawBoundingBox(prediction) {
    ctx.beginPath();
    ctx.rect(...prediction.bbox);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'yellow';
    ctx.fillStyle = 'yellow';
    ctx.stroke();
    ctx.closePath();
}

function drawLabel(prediction) {
    const text = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
    const x = prediction.bbox[0];
    const y = prediction.bbox[1] > 10 ? prediction.bbox[1] - 10 : 10;

    ctx.fillStyle = 'yellow';
    ctx.fillText(text, x, y);
    ctx.font = '18px Arial';
}

function playAudio() {
    let audio = document.getElementById('audio');
    audio.play();
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 500);
}
