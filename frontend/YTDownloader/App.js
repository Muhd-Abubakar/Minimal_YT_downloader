import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

const SERVER_URL = "minimalytdownloader-production.up.railway.app";
//const SERVER_PORT = "5000";
//const SERVER_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

export default function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleDownload() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      Alert.alert("Error", "Please paste a YouTube URL first.");
      return;
    }
    if (!trimmedUrl.includes("youtube.com") && !trimmedUrl.includes("youtu.be")) {
      Alert.alert("Error", "That doesn't look like a YouTube link.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus("Asking server to download…");

    try {
      // Step 1 — tell server to download the video
      const prepareRes = await fetch(`${SERVER_URL}/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const prepareData = await prepareRes.json();

      if (!prepareRes.ok || prepareData.error) {
        throw new Error(prepareData.error || "Server failed to download video.");
      }

      const filename = prepareData.filename;
      setStatus("Video ready, downloading to phone…");

      // Step 2 — GET the file
      const localUri = FileSystem.documentDirectory + filename;

      const downloadResumable = FileSystem.createDownloadResumable(
        `${SERVER_URL}/file/${encodeURIComponent(filename)}`,
        localUri,
        {},
        (downloadProgress) => {
          if (downloadProgress.totalBytesExpectedToWrite > 0) {
            const pct = Math.round(
              (downloadProgress.totalBytesWritten /
                downloadProgress.totalBytesExpectedToWrite) * 100
            );
            setProgress(pct);
            setStatus(`Downloading to phone… ${pct}%`);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (!result || result.status !== 200) {
        throw new Error("File download failed.");
      }

      setStatus("Saving…");

      const { status: permStatus } = await MediaLibrary.requestPermissionsAsync();
      if (permStatus === "granted") {
        await MediaLibrary.saveToLibraryAsync(result.uri);
        setStatus("✅ Saved to your gallery!");
        setUrl("");
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.uri, {
            mimeType: "video/mp4",
            dialogTitle: "Save your video",
          });
          setStatus("✅ Use share sheet to save!");
          setUrl("");
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("");
      Alert.alert("Failed", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📥 YT Downloader</Text>
      <Text style={styles.subtitle}>MP4 · 360P · SAVES TO GALLERY</Text>

      <TextInput
        style={styles.input}
        placeholder="Paste YouTube URL here…"
        placeholderTextColor="#888"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleDownload}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Download</Text>
        )}
      </TouchableOpacity>

      {loading && progress > 0 && (
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      )}

      {status !== "" && (
        <Text style={styles.status}>{status}</Text>
      )}

      <Text style={styles.footer}>Server: Railway, Build by Mohd Abubakar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ff3c3c",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 36,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    padding: 14,
    color: "#fff",
    fontSize: 15,
    marginBottom: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#ff3c3c",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#7a1c1c" },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#2a2a2a",
    borderRadius: 3,
    marginTop: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#ff3c3c",
    borderRadius: 3,
  },
  status: {
    marginTop: 20,
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    color: "#333",
    fontSize: 11,
  },
});
