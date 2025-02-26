import { Loader2, RefreshCw, Check, X } from "lucide-react";

export default function TranscribingProcess(props) {
  const handleReset = () => {
    props.setFile(null);
    props.setFileName("");
    props.setTaskId(null);
    props.setStatus(null);
    props.setResult(null);
    props.setError(null);
    props.setProgress(0);
    props.setAudioURL("");
    props.setShowRecorder(false);
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">File: {props.fileName}</h3>
          <p className="text-sm text-gray-500">Task ID: {props.taskId}</p>
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
                            ${
                              props.status === "SUCCESS" ? "text-green-600" : ""
                            }
                            ${props.status === "FAILURE" ? "text-red-600" : ""}
                            ${
                              props.status === "processing" ||
                              props.status === "PENDING"
                                ? "text-blue-600"
                                : ""
                            }
                          `}
          >
            {props.status === "SUCCESS" && "Completed"}
            {props.status === "FAILURE" && "Failed"}
            {props.status === "processing" && "Processing..."}
            {props.status === "PENDING" && "Waiting..."}
            {props.status === "uploading" && "Uploading..."}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              props.status === "SUCCESS" ? "bg-green-600" : "bg-blue-600"
            }`}
            style={{
              width: `${props.status === "SUCCESS" ? 100 : props.progress}%`,
            }}
          ></div>
        </div>
      </div>

      {props.status === "SUCCESS" && props.result && (
        <div className="mt-6">
          <h3 className="text-lg font-medium flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            Transcription Result
          </h3>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="whitespace-pre-wrap">{props.result}</p>
          </div>
        </div>
      )}

      {props.status === "processing" || props.status === "PENDING" ? (
        <div className="flex justify-center py-6">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="mt-2 text-gray-600">Transcribing your audio...</p>
            <p className="text-sm text-gray-500">This may take a few minutes</p>
          </div>
        </div>
      ) : null}

      {props.error && (
        <div className="text-red-500 text-sm flex items-center">
          <X className="h-4 w-4 mr-1" />
          {props.error}
        </div>
      )}
    </div>
  );
}
