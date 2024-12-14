const video = document.getElementById('webcam');
const result = document.getElementById('result');

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing webcam:', error);
    });

function captureFrame() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg'); 
}

function sendFrame() {
    const base64Image = captureFrame();
    fetch('/predictemotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image.split(',')[1] })
    })
    .then(response => response.json())
    .then(data => {
        if (data.emotion) {
            result.textContent = `Detected Emotion: ${data.emotion}`;
        } else {
            result.textContent = 'No face detected';
        }
    })
    .catch(error => console.error('Error:', error));
}

setInterval(sendFrame, 200);
