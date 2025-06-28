import React, { useEffect, useState } from 'react';
import useMediaRecorder from '../../hooks/useMediaRecorder';
import useWebcam from '../../hooks/useWebcam';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number;
  autoStart?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 30000,
  autoStart = false,
}) => {
  const { stream, startWebcam, stopWebcam } = useWebcam({ audio: true, video: false });
  const [isRecording, setIsRecording] = useState(false);
  const {
    status,
    recordedBlob,
    startRecording,
    stopRecording,
    clearRecording,
    duration,
  } = useMediaRecorder({
    stream,
    mimeType: 'audio/webm',
    maxDuration,
  });

  useEffect(() => {
    startWebcam().catch(err => console.error('Mic error', err));
    return () => {
      stopWebcam();
      setIsRecording(false);
    };
  }, [startWebcam, stopWebcam]);

  useEffect(() => {
    if (autoStart && stream && !isRecording && status === 'inactive') {
      startRecording();
      setIsRecording(true);
    }
  }, [autoStart, stream, isRecording, status, startRecording]);

  useEffect(() => {
    if (status === 'stopped' && recordedBlob && isRecording) {
      onRecordingComplete(recordedBlob);
      clearRecording();
      setIsRecording(false);
    }
  }, [status, recordedBlob, onRecordingComplete, clearRecording, isRecording]);

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {isRecording && (
        <p className="text-sm text-red-600">
          {Math.round(duration / 1000)}s / {maxDuration / 1000}s
        </p>
      )}
      {autoStart ? (
        <button
          onClick={() => {
            stopRecording();
            setIsRecording(false);
          }}
          className="btn btn-primary flex items-center gap-2"
          disabled={!stream || !isRecording}
        >
          <StopIcon className="h-5 w-5" />
          Stop Recording
        </button>
      ) : (
        <button
          onClick={handleButtonClick}
          className="btn btn-primary flex items-center gap-2"
          disabled={!stream}
        >
          {isRecording ? (
            <StopIcon className="h-5 w-5" />
          ) : (
            <MicrophoneIcon className="h-5 w-5" />
          )}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;
