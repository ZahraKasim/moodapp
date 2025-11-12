from flask import Blueprint, render_template, request, jsonify, url_for
import cv2
import pandas as pd
import time
from deepface import DeepFace  # new import

main = Blueprint("main", __name__)


song_files = {
    "tum hi ho": "6.mp3",
    "i wanna be yours": "2.mp3",
    "pehli nazar mein": "5.mp3",
    "jo tum mere ho": "3.mp3",
    "nadaniya": "4.mp3",
    "baatein ye kabhi na": "7.mp3",
    "channa mereya": "8.mp3",
    "ghungroo": "9.mp3",
    "hamari adhuri kahani": "10.mp3",
    "khamoshiyan": "11.mp3",
    "kya jhumka": "12.mp3",
    "nashe si chadhgayi": "13.mp3",
    "sahiba": "1.mp3",
    "sooraj duba hai": "14.mp3"
     # add more tracks here
}



# Load Haar cascade for face detection (optional, but still useful for camera)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Load dataset
try:
    df = pd.read_csv("app/spotify_dataset.csv")
except FileNotFoundError:
    df = pd.DataFrame()  # empty fallback

def detect_mood():
    cap = cv2.VideoCapture(0)
    mood = "sad"  # default
    start_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert to grayscale for Haarcascade
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        # Draw rectangles around detected faces
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        try:
            # Analyze emotions with DeepFace
            result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            dominant_emotion = result[0]['dominant_emotion']

            if dominant_emotion == "happy":
                mood = "happy"
            elif dominant_emotion == "sad":
                mood = "sad"
            else:
                mood = "sad"  # map other emotions to sad

            # Show live mood on the frame
            cv2.putText(frame, f"Mood: {mood}", (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        except Exception as e:
            print("Emotion detection error:", e)

        # 🔹 Show the live camera feed with face box + mood text
        cv2.imshow("Mood Detection - Press 'q' to quit", frame)
        cv2.namedWindow("Mood Detection - Press 'q' to quit", cv2.WINDOW_NORMAL)  # make window resizable
        cv2.setWindowProperty("Mood Detection - Press 'q' to quit",
                              cv2.WND_PROP_TOPMOST, 1)  # keep on top

        cv2.imshow("Mood Detection - Press 'q' to quit", frame)

        # Stop after 10 sec or if 'q' pressed
        if (time.time() - start_time) > 7 or cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Freeze final mood on screen for 2 seconds before closing
    cv2.putText(frame, f"Final Mood: {mood}", (50, 100),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
    cv2.imshow("Mood Detection - Final Result", frame)
    cv2.waitKey(1000)  # 2 sec pause

    cap.release()
    cv2.destroyAllWindows()
    return mood


@main.route("/")
def home():
    return render_template("home.html")


@main.route("/recommend", methods=["POST"])
def recommend():
    artist_input = request.form.get("artist", "").lower()

    if df.empty:
        return jsonify({"error": "⚠️ Dataset not found."})

    mood = detect_mood()

    artist_df = df[df["artist_name"].str.lower().str.contains(artist_input)]
    if artist_df.empty:
        return jsonify({"error": "⚠️ No songs found for that artist."})

    if mood == "happy":
        filtered_df = artist_df[artist_df["valence"] > 0.5]
    else:
        filtered_df = artist_df[artist_df["valence"] <= 0.5]

    if filtered_df.empty:
        return jsonify({"error": "⚠️ No songs found for this mood."})

    top_songs = filtered_df[["track_name", "artist_name"]].drop_duplicates().head(6)

    songs_list = []

    for _, row in top_songs.iterrows():
        track_lower = row["track_name"].lower()
        file_name = song_files.get(track_lower)  # lookup in your dictionary
        if file_name:  # only if the MP3 exists
            file_url = url_for("static", filename=f"songs/{file_name}")
        else:
            file_url = None
        songs_list.append({
            "track": row["track_name"],
            "artist": row["artist_name"],
            "file_url": file_url
        })

    return jsonify({"mood": mood, "songs": songs_list})

