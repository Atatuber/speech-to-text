import React, { useState, useEffect } from "react";
import {
  Play,
  FileAudio,
  Loader2,
  FileText,
  RefreshCw,
  Check,
  X,
} from "lucide-react";

const TranscriptionApp = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "audio/mpeg") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    } else {
      setFile(null);
      setFileName("");
      setError("Please select an MP3 file");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an MP3 file");
      return;
    }

    setLoading(true);
    setStatus("uploading");
    setProgress(0);
    setError(null);
    setResult(null);

    // Simulate upload progress
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

  // Poll for transcription result
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
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [taskId, status]);

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setFileName("");
    setTaskId(null);
    setStatus(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <FileAudio className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Audio Transcription</h1>
          </div>
          <p className="mt-2 opacity-90">
            Upload an MP3 file and get it transcribed automatically
          </p>
        </div>

        <div className="p-6">
          {!taskId || status === "failed" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
                  ${
                    error
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
                onClick={() => document.getElementById("file-upload").click()}
              >
                {file ? (
                  <div className="flex flex-col items-center">
                    <Play className="h-12 w-12 text-blue-500 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Selected file:</p>
                    <p className="font-medium text-center break-all">
                      {fileName}
                    </p>
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
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">File: {fileName}</h3>
                  <p className="text-sm text-gray-500">Task ID: {taskId}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="py-2 px-4 flex items-center text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  New Transcription
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Status: </span>
                  <span
                    className={`
                    ${status === "SUCCESS" ? "text-green-600" : ""}
                    ${status === "FAILURE" ? "text-red-600" : ""}
                    ${
                      status === "processing" || status === "PENDING"
                        ? "text-blue-600"
                        : ""
                    }
                  `}
                  >
                    {status === "SUCCESS" && "Completed"}
                    {status === "FAILURE" && "Failed"}
                    {status === "processing" && "Processing..."}
                    {status === "PENDING" && "Waiting..."}
                    {status === "uploading" && "Uploading..."}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      status === "SUCCESS" ? "bg-green-600" : "bg-blue-600"
                    }`}
                    style={{
                      width: `${status === "SUCCESS" ? 100 : progress}%`,
                    }}
                  ></div>
                </div>
              </div>

              {status === "SUCCESS" && result && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Transcription Result
                  </h3>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="whitespace-pre-wrap">{result}</p>
                  </div>
                </div>
              )}

              {status === "processing" || status === "PENDING" ? (
                <div className="flex justify-center py-6">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="mt-2 text-gray-600">
                      Transcribing your audio...
                    </p>
                    <p className="text-sm text-gray-500">
                      This may take a few minutes
                    </p>
                  </div>
                </div>
              ) : null}

              {error && (
                <div className="text-red-500 text-sm flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Powered by Whisper AI • Supports MP3 audio files
      </p>
    </div>
  );
};

export default TranscriptionApp;
