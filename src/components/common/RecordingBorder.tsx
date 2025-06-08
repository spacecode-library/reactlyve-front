import React, { useState, useEffect } from 'react';

interface RecordingBorderProps {
  isVisible: boolean;
}

const RecordingBorder: React.FC<RecordingBorderProps> = ({ isVisible }) => {
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) {
    return null;
  }

  const DURATION_SHORT_SIDE_S = 2.5;
  const DURATION_LONG_SIDE_S = 5;

  const topBottomDuration = isPortrait ? DURATION_SHORT_SIDE_S : DURATION_LONG_SIDE_S;
  const leftRightDuration = isPortrait ? DURATION_LONG_SIDE_S : DURATION_SHORT_SIDE_S;

  const delayRightS = topBottomDuration;
  const delayBottomS = topBottomDuration + leftRightDuration;
  const delayLeftS = topBottomDuration + leftRightDuration + topBottomDuration;

  return (
    <>
      {/* Static Borders (Width 1) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-red-500 z-40" /> {/* Top - Changed to h-1 */}
      <div className="fixed top-0 bottom-0 right-0 w-1 bg-red-500 z-40" /> {/* Right - Changed to w-1 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-red-500 z-40" /> {/* Bottom - Changed to h-1 */}
      <div className="fixed top-0 bottom-0 left-0 w-1 bg-red-500 z-40" /> {/* Left - Changed to w-1 */}

      {/* Animated "Snake" Borders (Width 2) */}
      {/* Top Animated */}
      <div
        className="fixed top-0 left-0 h-2 bg-red-500 animate-snake-border-top z-50" // Changed to h-2
        style={{
          animationDuration: `${topBottomDuration}s`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards',
          animationIterationCount: 'infinite',
        }}
      />
      {/* Right Animated */}
      <div
        className="fixed top-0 right-0 w-2 bg-red-500 animate-snake-border-right z-50" // Changed to w-2
        style={{
          animationDuration: `${leftRightDuration}s`,
          animationDelay: `${delayRightS}s`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards',
          animationIterationCount: 'infinite',
        }}
      />
      {/* Bottom Animated */}
      <div
        className="fixed bottom-0 right-0 h-2 bg-red-500 animate-snake-border-bottom z-50" // Changed to h-2
        style={{
          animationDuration: `${topBottomDuration}s`,
          animationDelay: `${delayBottomS}s`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards',
          animationIterationCount: 'infinite',
        }}
      />
      {/* Left Animated */}
      <div
        className="fixed bottom-0 left-0 w-2 bg-red-500 animate-snake-border-left z-50" // Changed to w-2
        style={{
          animationDuration: `${leftRightDuration}s`,
          animationDelay: `${delayLeftS}s`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards',
          animationIterationCount: 'infinite',
        }}
      />
    </>
  );
};

export default RecordingBorder;
