import React, { useEffect } from 'react';
import useMediaRecorder from '../../hooks/useMediaRecorder';
import useWebcam from '../../hooks/useWebcam';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 30000,
}) => {
  const { stream, startWebcam, stopWebcam } = useWebcam({ audio: true, video: false });
  const { status, recordedBlob, startRecording, stopRecording, clearRecording } = useMediaRecorder({
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
      <button
        onClick={status === 'recording' ? stopRecording : startRecording}
        className="btn btn-primary"
        disabled={!stream}
      >
        {status === 'recording' ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default AudioRecorder;
