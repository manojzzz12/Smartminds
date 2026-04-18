import { useState } from "react";
import { http } from "../api/http";

const modes = [
  "summary",
  "detailed",
  "qa",
  "audio",
  "mindmap",
  "quiz"
];

export function UploadPanel({ notebookId, onUploaded, selectedMode, onModeChange }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const isReady = Boolean(file && notebookId && !isUploading);

  async function handleUpload() {
    if (!file || !notebookId || isUploading) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("notebookId", notebookId);

    setIsUploading(true);
    setProgress(0);
    setStatus("Uploading and analyzing source...");
    try {
      await http.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)));
        }
      });
      setProgress(100);
      setStatus("File analyzed and added to the notebook.");
      setFile(null);
      onUploaded();
    } catch (error) {
      const message = error.response?.data?.message || "Upload failed.";
      const details = error.response?.data?.details;
      setStatus(details ? `${message} ${details}` : message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="panel upload-panel">
      <div className="panel-header">
        <div>
          <h2>Source Ingestion</h2>
          <p>Upload PDFs, Office docs, images, audio, and video into this notebook.</p>
        </div>
        <div className="panel-kicker">Ingestion Hub</div>
      </div>
      <div className="upload-grid">
        <label className="upload-dropzone">
          <input
            type="file"
            disabled={isUploading}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <span>{file ? file.name : "Choose a source file"}</span>
          <small>
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
              : "PDF, DOCX, XLSX, image, audio, video, or text"}
          </small>
        </label>
        <div className="mode-picker">
          <span>How do you want the output?</span>
          <div className="mode-options">
            {modes.map((mode) => (
              <button
                key={mode}
                className={`chip ${selectedMode === mode ? "active" : ""}`}
                disabled={isUploading}
                onClick={() => onModeChange(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <button className="primary-button" onClick={handleUpload} disabled={!isReady}>
          {isUploading ? "Analyzing..." : "Upload and Analyze"}
        </button>
      </div>
      {isUploading ? (
        <div className="progress-shell" aria-live="polite">
          <div className="progress-copy">
            <span>Progress</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}
      {status ? (
        <p className={`status-text ${status.includes("failed") ? "error-text" : ""}`}>
          {status}
        </p>
      ) : null}
    </section>
  );
}
