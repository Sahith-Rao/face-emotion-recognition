document.getElementById('submitButton').addEventListener('click', () => {
    const input = document.getElementById('imageInput');
    if (input.files.length === 0) {
        alert('Please select an image first!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        const base64Image = reader.result;

        fetch('/predictemotion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById('result');
            if (data.error) {
                resultDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            } else {
                resultDiv.innerHTML = `
                    <p>Detected Emotion: ${data.emotion}</p>
                    <p>Face Coordinates: (${data.x1}, ${data.y1}), (${data.x2}, ${data.y2})</p>
                `;
            }
        })
        .catch(error => console.error('Error:', error));
    };

    reader.readAsDataURL(input.files[0]);
});
