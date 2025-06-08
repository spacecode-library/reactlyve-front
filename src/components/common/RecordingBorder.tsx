import React from 'react';

interface RecordingBorderProps {
  isVisible: boolean;
}

const RecordingBorder: React.FC<RecordingBorderProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  // Tailwind classes for animation are defined in tailwind.config.js
  // Inline styles are used for animation duration, delay, timing function, fill mode, and iteration count.

  return (
    <>
      {/* Top Border */}
      <div
        className="fixed top-0 left-0 h-1 bg-red-500 animate-snake-border-top"
        style={{ animationDuration: '0.75s', animationTimingFunction: 'linear', animationFillMode: 'forwards', animationIterationCount: 'infinite' }}
      />
      {/* Right Border */}
      <div
        className="fixed top-0 right-0 w-1 bg-red-500 animate-snake-border-right"
        style={{ animationDelay: '0.75s', animationDuration: '0.75s', animationTimingFunction: 'linear', animationFillMode: 'forwards', animationIterationCount: 'infinite' }}
      />
      {/* Bottom Border */}
      <div
        className="fixed bottom-0 right-0 h-1 bg-red-500 animate-snake-border-bottom"
        style={{ animationDelay: '1.5s', animationDuration: '0.75s', animationTimingFunction: 'linear', animationFillMode: 'forwards', animationIterationCount: 'infinite' }}
      />
      {/* Left Border */}
      <div
        className="fixed bottom-0 left-0 w-1 bg-red-500 animate-snake-border-left"
        style={{ animationDelay: '2.25s', animationDuration: '0.75s', animationTimingFunction: 'linear', animationFillMode: 'forwards', animationIterationCount: 'infinite' }}
      />
    </>
  );
};

export default RecordingBorder;
