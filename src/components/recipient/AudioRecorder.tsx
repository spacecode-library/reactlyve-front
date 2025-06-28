import React, { useEffect } from 'react';
import useMediaRecorder from '../../hooks/useMediaRecorder';
import useWebcam from '../../hooks/useWebcam';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 30000,
}) => {
  const { stream, startWebcam, stopWebcam } = useWebcam({ audio: true, video: false });
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
    };
  }, [startWebcam, stopWebcam]);

  useEffect(() => {
    if (status === 'stopped' && recordedBlob) {
      onRecordingComplete(recordedBlob);
      clearRecording();
    }
  }, [status, recordedBlob, onRecordingComplete, clearRecording]);

  return (
    <div className="flex flex-col items-center space-y-2">
      {status === 'recording' && (
        <p className="text-sm text-red-600">
          {Math.round(duration / 1000)}s / {maxDuration / 1000}s
        </p>
      )}
      <button
        onClick={status === 'recording' ? stopRecording : startRecording}
        className="btn btn-primary flex items-center gap-2"
        disabled={!stream}
      >
        {status === 'recording' ? (
          <StopIcon className="h-5 w-5" />
        ) : (
          <MicrophoneIcon className="h-5 w-5" />
        )}
        {status === 'recording' ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default AudioRecorder;
