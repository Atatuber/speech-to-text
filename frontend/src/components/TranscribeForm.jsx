import { useState, useRef } from "react";

import {
  Play,
  FileAudio,
  Loader2,
  FileText,
  X,
  Mic,
  StopCircle,
  Volume2,
} from "lucide-react";

export default function TranscribeForm({
  showRecorder,
  setShowRecorder,
  file,
  setFile,
  error,
  setError,
  audioURL,
  setAudioURL,
  mediaRecorderRef,
  timerRef,
  setStatus,
  fileName,
  setFileName,
  setProgress,
  setResult,
  setTaskId,
}) {
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const audioChunksRef = useRef([]);

  console.log(isRecording);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an MP3 file or record audio");
      return;
    }

    setLoading(true);
    setStatus("uploading");
    setProgress(0);
    setError(null);
    setResult(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Failed to upload audio file");
      }

      const data = await response.json();
      setTaskId(data.task_id);
      setStatus(data.status);
      setProgress(100);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message);
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "audio/mpeg") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
      setAudioURL("");
    } else {
      setFile(null);
      setFileName("");
      setError("Please select an MP3 file");
    }
  };

  const startRecording = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mpeg",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        const now = new Date();
        const recordedFileName = `recording_${now
          .toISOString()
          .replace(/[:.]/g, "-")}.mp3`;
        const recordedFile = new File([audioBlob], recordedFileName, {
          type: "audio/mpeg",
        });

        setFile(recordedFile);
        setFileName(recordedFileName);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError(
        "Cannot access microphone. Please ensure you have given permission."
      );
      console.error("Error accessing media devices:", err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const toggleRecorder = () => {
    setShowRecorder((prev) => !prev);
    if (isRecording) {
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!showRecorder ? (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
                ${
                  error
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
            onClick={() => document.getElementById("file-upload").click()}
          >
            {file && !audioURL ? (
              <div className="flex flex-col items-center">
                <Play className="h-12 w-12 text-blue-500 mb-2" />
                <p className="text-sm text-gray-500 mb-1">Selected file:</p>
                <p className="font-medium text-center break-all">{fileName}</p>
              </div>
            ) : audioURL ? (
              <div className="flex flex-col items-center">
                <Volume2 className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-sm text-gray-500 mb-1">
                  Recording complete:
                </p>
                <p className="font-medium text-center break-all">{fileName}</p>
                <audio className="mt-3" src={audioURL} controls />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileAudio className="h-12 w-12 text-gray-400 mb-2" />
                <p className="font-medium mb-1">
                  Drag and drop your MP3 file here
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
            )}
            <input
              id="file-upload"
              type="file"
              accept="audio/mpeg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleRecorder}
              className="py-2 px-4 flex items-center justify-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg"
            >
              <Mic className="h-4 w-4 mr-1" />
              Record Audio Instead
            </button>
          </div>
        </>
      ) : (
        <div className="border-2 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center mb-4">
              {isRecording ? (
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <StopCircle
                      className="h-16 w-16 text-red-500 hover:text-red-600 cursor-pointer"
                      onClick={stopRecording}
                    />
                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
                  </div>
                  <p className="text-lg font-bold">
                    {formatTime(recordingTime)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Recording in progress...
                  </p>
                </div>
              ) : audioURL ? (
                <div className="flex flex-col items-center">
                  <Volume2 className="h-12 w-12 text-green-500 mb-2" />
                  <p className="font-medium">Recording complete!</p>
                  <audio className="mt-3 w-full" src={audioURL} controls />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Mic
                    className="h-16 w-16 text-blue-500 hover:text-blue-600 cursor-pointer"
                    onClick={startRecording}
                  />
                  <p className="mt-2 font-medium">Click to start recording</p>
                  <p className="text-sm text-gray-500">
                    Make sure your microphone is connected
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleRecorder}
                className="py-2 px-4 flex items-center justify-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg"
              >
                <FileAudio className="h-4 w-4 mr-1" />
                Upload Audio Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={!file || loading}
          className={`flex-1 py-3 px-4 flex justify-center items-center rounded-lg text-white font-medium
              ${
                !file || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2" />
              Transcribe Audio
            </>
          )}
        </button>
      </div>
    </form>
  );
}
