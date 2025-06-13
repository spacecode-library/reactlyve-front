import React from 'react';

interface RecordingBorderProps {
  isVisible: boolean;
}

const RecordingBorder: React.FC<RecordingBorderProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 rounded-md border-[12px] md:border-[20px] border-red-500 animate-record-glow-md md:animate-record-glow-lg" />
  );
};

export default RecordingBorder;
