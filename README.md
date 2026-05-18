# 📥 Minimal YT Downloader

A lightweight YouTube video downloader built for **low-end Android devices** (Android 6+). Paste a YouTube link, hit Download, and the video saves directly to your gallery as MP4 360p — no bloat, no ads, no account needed.

> Built entirely from a WSL Ubuntu terminal + VS Code. No Android Studio required.

---

## ✨ Features

- Downloads YouTube videos as MP4 (360p) — optimized for low storage devices
- Saves directly to phone gallery
- Minimal dark UI — runs smooth on Android 6
- Flask backend powered by yt-dlp
- Works over local WiFi or deployed to the cloud (Railway)
- Built with React Native (Expo SDK 49) — no Android Studio needed to build

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo SDK 49) |
| Backend | Python + Flask + yt-dlp |
| Deployment | Railway.app |
| Build | EAS Build (Expo) |
| Dev Environment | WSL Ubuntu + VS Code |

---

## 📁 Project Structure

```
yt-downloader/
├── backend/
│   ├── server.py          # Flask API
│   ├── requirements.txt
│   ├── Dockerfile
│   └── downloads/         # Videos stored here temporarily
└── frontend/
    └── YTDownloader/
        ├── App.js          # Main React Native app
        ├── app.json        # Expo config
        └── eas.json        # EAS build config
```

---

## 🚀 Running Locally

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py
```
Flask runs at `http://0.0.0.0:5000`

### Frontend (Expo)
```bash
cd frontend/YTDownloader
npm install
npx expo start
```

Update `SERVER_URL` in `App.js` to your local machine's IP before running.

---

## 📱 Building the APK

No Android Studio needed — uses EAS cloud or local build:

```bash
# Cloud build (free tier)
eas build -p android --profile preview

# Local build
eas build -p android --profile preview --local
```

Install the APK on your phone: **Settings → Security → Unknown Sources → Enable**

---

## ☁️ Deploying Backend to Railway

```bash
cd backend
railway login
railway init
railway up
```

Then update `SERVER_URL` in `App.js` to your Railway domain and rebuild the APK.

---

## ⚙️ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/ping` | Health check |
| POST | `/prepare` | Download video on server, returns filename |
| GET | `/file/<filename>` | Stream MP4 file to phone |

---

## 📋 Requirements

- Python 3.10+
- Node.js 18+
- Expo CLI + EAS CLI
- ffmpeg (for yt-dlp)

---

## 🔧 Android 6 Compatibility Notes

- `minSdkVersion: 23` (Android 6.0)
- `targetSdkVersion: 31` (avoids scoped storage enforcement)
- Legacy `WRITE_EXTERNAL_STORAGE` permission included
- HTTP cleartext allowed for local network use

---

## 👤 Author

**Mohd Abubakar**  
Built to solve a real problem — making YouTube accessible on a low-end Android 6 phone.

---

## 📄 License

MIT — free to use, modify, and share.
