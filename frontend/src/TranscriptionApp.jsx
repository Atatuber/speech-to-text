import React, { useState, useEffect, useRef } from "react";
import { FileAudio } from "lucide-react";
import TranscribeForm from "./components/TranscribeForm";
import TranscribingProcess from "./components/TranscribingProcess";

const TranscriptionApp = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const [audioURL, setAudioURL] = useState("");
  const [showRecorder, setShowRecorder] = useState(false);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let pollingInterval;

    if (taskId && status !== "SUCCESS" && status !== "FAILURE") {
      setStatus("processing");

      pollingInterval = setInterval(async () => {
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/upload/${taskId}`
          );
          if (!response.ok) {
            throw new Error("Failed to get transcription status");
          }

          const data = await response.json();
          setStatus(data.status);

          if (data.status === "SUCCESS" && data.result) {
            setResult(data.result);
            clearInterval(pollingInterval);
          } else if (data.status === "FAILURE") {
            setError("Transcription failed");
            clearInterval(pollingInterval);
          }
        } catch (err) {
          setError(err.message);
          clearInterval(pollingInterval);
        }
      }, 2000);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [taskId, status]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <FileAudio className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Audio Transcription</h1>
          </div>
          <p className="mt-2 opacity-90">
            Upload or record audio and get it transcribed automatically
          </p>
        </div>

        <div className="p-6">
          {!taskId || status === "failed" ? (
            <TranscribeForm
              showRecorder={showRecorder}
              setShowRecorder={setShowRecorder}
              file={file}
              setFile={setFile}
              error={error}
              setError={setError}
              audioURL={audioURL}
              setAudioURL={setAudioURL}
              mediaRecorderRef={mediaRecorderRef}
              timerRef={timerRef}
              setStatus={setStatus}
              fileName={fileName}
              setFileName={setFileName}
              setProgress={setProgress}
              setResult={setResult}
              setTaskId={setTaskId}
            />
          ) : (
            <TranscribingProcess
              fileName={fileName}
              taskId={taskId}
              status={status}
              progress={progress}
              result={result}
              error={error}
              setFile={setFile}
              setFileName={setFileName}
              setTaskId={setTaskId}
              setStatus={setStatus}
              setResult={setResult}
              setError={setError}
              setProgress={setProgress}
              setAudioURL={setAudioURL}
              setShowRecorder={setShowRecorder}
              audioURL={audioURL}
            />
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Powered by Whisper AI • Supports MP3 audio files and direct recording
      </p>
    </div>
  );
};

export default TranscriptionApp;
