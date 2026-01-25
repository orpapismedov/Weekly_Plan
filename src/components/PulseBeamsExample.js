import React from 'react';
import { PulseBeams } from './PulseBeams';

// Example usage of PulseBeams
const PulseBeamsExample = () => {
  const beams = [
    {
      path: "M100,100 L200,200 L300,100",
      gradientConfig: {
        initial: {
          x1: "100",
          x2: "200",
          y1: "100",
          y2: "200"
        },
        animate: {
          x1: ["100", "300"],
          x2: ["200", "400"],
          y1: ["100", "100"],
          y2: ["200", "200"]
        },
        transition: {
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }
      },
      connectionPoints: [
        { cx: 100, cy: 100, r: 4 },
        { cx: 200, cy: 200, r: 4 },
        { cx: 300, cy: 100, r: 4 }
      ]
    }
  ];

  return (
    <PulseBeams
      beams={beams}
      width={800}
      height={600}
      baseColor="#1e293b"
      accentColor="#475569"
      gradientColors={{
        start: "#667eea",
        middle: "#764ba2",
        end: "#f093fb"
      }}
      background={
        <div style={{ 
          background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
          width: '100%',
          height: '100%',
          position: 'absolute'
        }} />
      }
    >
      <div style={{ color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>
          Your Content Here
        </h1>
        <p style={{ fontSize: '1.25rem' }}>
          Place any content you want on top of the animated beams
        </p>
      </div>
    </PulseBeams>
  );
};

export default PulseBeamsExample;
