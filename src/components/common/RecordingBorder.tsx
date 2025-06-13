import React from 'react';

interface RecordingBorderProps {
  isVisible: boolean;
}

const RecordingBorder: React.FC<RecordingBorderProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 border-4 md:border-[7px] border-red-500" />
      <div className="absolute inset-0 rounded-xl animate-record-glow-md md:animate-record-glow-lg" />
    </div>
  );
};

export default RecordingBorder;
