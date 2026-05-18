from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
import re

app = Flask(__name__)
CORS(app)

DOWNLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "downloads")
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)


def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "_", name)


@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "running"})


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok"})


@app.route("/prepare", methods=["POST"])
def prepare_video():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    if "youtube.com" not in url and "youtu.be" not in url:
        return jsonify({"error": "Not a valid YouTube URL"}), 400

    ydl_opts = {
        "format": "18",
        "outtmpl": os.path.join(DOWNLOAD_FOLDER, "%(title)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)

            title = sanitize_filename(info.get("title", "video"))
            filename = f"{title}.mp4"
            filepath = os.path.join(DOWNLOAD_FOLDER, filename)

            if not os.path.exists(filepath):
                files = sorted(
                    [
                        f for f in os.listdir(DOWNLOAD_FOLDER)
                        if f.endswith(".mp4")
                    ],
                    key=lambda f: os.path.getmtime(
                        os.path.join(DOWNLOAD_FOLDER, f)
                    ),
                    reverse=True,
                )

                if not files:
                    return jsonify({"error": "Download failed"}), 500

                filename = files[0]

        return jsonify({"filename": filename})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/file/<filename>", methods=["GET"])
def serve_file(filename):
    filepath = os.path.join(DOWNLOAD_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    return send_file(
        filepath,
        mimetype="video/mp4",
        as_attachment=True,
        download_name=filename
    )


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8080)),
        debug=False
    )
