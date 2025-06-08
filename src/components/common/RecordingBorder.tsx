import React from 'react';

interface RecordingBorderProps {
  isVisible: boolean;
}

const RecordingBorder: React.FC<RecordingBorderProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Top Border */}
      <div
        className="fixed top-0 left-0 h-3 bg-red-500 animate-snake-border-top" // Changed
        style={{
          animationDuration: '1.25s',
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          animationIterationCount: 'infinite',
        }}
      />
      {/* Right Border */}
      <div
        className="fixed top-0 right-0 w-3 bg-red-500 animate-snake-border-right" // Changed
        style={{
          animationDelay: '1.25s',
          animationDuration: '1.25s',
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          animationIterationCount: 'infinite',
        }}
      />
      {/* Bottom Border */}
      <div
        className="fixed bottom-0 right-0 h-3 bg-red-500 animate-snake-border-bottom" // Changed
        style={{
          animationDelay: '2.5s',
          animationDuration: '1.25s',
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          animationIterationCount: 'infinite',
        }}
      />
      {/* Left Border */}
      <div
        className="fixed bottom-0 left-0 w-3 bg-red-500 animate-snake-border-left" // Changed
        style={{
          animationDelay: '3.75s',
          animationDuration: '1.25s',
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          animationIterationCount: 'infinite',
        }}
      />
    </>
  );
};

export default RecordingBorder;
