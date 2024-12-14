from flask import Flask, request, jsonify, render_template
import cv2
import numpy as np
import base64
import tensorflow as tf
from flask_cors import CORS

model = tf.keras.models.load_model("emotiondetector.h5")
haar_file = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(haar_file)

def extract_features(image):
    feature = np.array(image)
    feature = feature.reshape(1, 48, 48, 1)
    return feature / 255.0

app = Flask(__name__)
CORS(app, origins='*')

@app.route('/')
def home():
    return render_template('index.html')

labels = {0: 'angry', 1: 'disgust', 2: 'fear', 3: 'happy', 4: 'neutral', 5: 'sad', 6: 'surprise'}

@app.route('/predictemotion', methods=['POST'])
def predictemotion():
    data = request.get_json()
    if data is None or 'image' not in data:
        return jsonify({"error": "Invalid request"}), 400
    
    string_image = data['image']
    string_image = base64.b64decode(string_image)
    nparr_image = np.frombuffer(string_image, np.uint8)
    img = cv2.imdecode(nparr_image, cv2.IMREAD_GRAYSCALE)
    faces = face_cascade.detectMultiScale(img, 1.3, 5)
    
    for (x, y, w, h) in faces:
        face = img[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48))
        features = extract_features(face)
        pred = model.predict(features)
        prediction_label = labels[np.argmax(pred)]
        return jsonify({"emotion": prediction_label}), 200
    
    return jsonify({"emotion": "No face detected"}), 200

if __name__ == "__main__":
    app.run(debug=True)
