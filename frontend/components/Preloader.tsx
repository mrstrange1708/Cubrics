"use client";

import React, { useEffect, useRef } from 'react';

const Preloader: React.FC = () => {
  const lidRef = useRef<SVGPathElement>(null);
  const cubeRef = useRef<SVGGElement>(null);
  const baseRef = useRef<SVGPathElement>(null);

  const lid_coordinates = [
    [[-3,3,3],[-3,-3,3],[3,-3,3],[3,3,3],[-3,3,3],[-3,3,1],[-3,-3,1],[3,-3,1],[3,-3,3]],
    [[3,1,3],[-3,1,3],[-3,1,1]],
    [[3,-1,3],[-3,-1,3],[-3,-1,1]],
    [[-3,-3,3],[-3,-3,1]],
    [[-1,-3,1],[-1,-3,3],[-1,3,3]],
    [[1,-3,1],[1,-3,3],[1,3,3]]
  ];

  const base_coordinates = [
    [[-3,3,1],[3,3,1],[3,-3,1],[-3,-3,1],[-3,3,1],[-3,3,-3],[-3,-3,-3],[3,-3,-3],[3,-3,1]],
    [[1,-3,-3],[1,-3,1],[1,1,1],[-3,1,1],[-3,1,-3]],
    [[-1,-3,-3],[-1,-3,1],[-1,-1,1],[-3,-1,1],[-3,-1,-3]],
    [[-3,-3,-3],[-3,-3,1]],
    [[-3,3,-1],[-3,-3,-1],[3,-3,-1]]
  ];

  const u = 4;

  function project(coordinatesGroup: number[][][], t: number) {
    return coordinatesGroup.map((coordinatesSubGroup) => {
      return coordinatesSubGroup.map((coordinates) => {
        const x = coordinates[0];
        const y = coordinates[1];
        const z = coordinates[2];

        return [
          (x * Math.cos(t) - y * Math.sin(t)) * u + 30,
          (x * -Math.sin(t) - y * Math.cos(t) - z * Math.sqrt(2)) * u / Math.sqrt(3) + 30
        ];
      });
    });
  }

  function toPath(coordinates: any) {
    return 'M' + (JSON
      .stringify(coordinates)
      .replace(/]],\[\[/g, 'M')
      .replace(/],\[/g, 'L')
      .slice(3, -3)
    );
  }

  function easing(t: number) {
    return (2 - Math.cos(Math.PI * t)) % 2 * Math.PI / 4;
  }

  useEffect(() => {
    let t = 0;
    let animationFrameId: number;

    const tick = () => {
      t = (t + 1/60) % 3; // Use 1/60 for 60fps
      if (cubeRef.current) {
        cubeRef.current.style.transform = `rotate(${Math.floor(t) * 120}deg)`;
      }
      if (lidRef.current) {
        lidRef.current.setAttribute('d', toPath(project(lid_coordinates, easing(t))));
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (baseRef.current) {
      baseRef.current.setAttribute('d', toPath(project(base_coordinates, Math.PI / 4)));
    }

    tick();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <svg viewBox="0 0 60 60" width="160" stroke="#6D7582" strokeWidth="0.5" strokeLinejoin="round" className="bg-transparent overflow-visible">
          <g ref={cubeRef} style={{ transformOrigin: '50% 50%' }} fill="none">
            <path ref={baseRef} stroke="#3b82f6" strokeWidth="1" />
            <path ref={lidRef} stroke="#6366f1" strokeWidth="1" />
          </g>
        </svg>
        <span className="text-white font-mono tracking-widest text-xl animate-pulse">
          INITIALIZING Cubrics...
        </span>
      </div>
    </div>
  );
};

export default Preloader;
