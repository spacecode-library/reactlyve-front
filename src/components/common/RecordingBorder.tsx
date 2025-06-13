import React from 'react';

interface RecordingBorderProps {
  isVisible: boolean;
}

const RecordingBorder: React.FC<RecordingBorderProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 rounded-md border-4 border-red-500 animate-record-glow" />
  );
};

export default RecordingBorder;
