'use client';

import React, { useRef, useState } from 'react';

interface PerspectiveCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt degrees (default 6)
  glint?: boolean;
  depth?: boolean;
  onClick?: () => void;
}

export default function PerspectiveCard({
  children,
  className = '',
  maxTilt = 5,
  glint = true,
  depth = true,
  onClick,
}: PerspectiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glintX = (x / rect.width) * 100;
    const glintY = (y / rect.height) * 100;

    setTransformStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px) scale3d(1.015, 1.015, 1.015)`,
      // @ts-ignore
      '--gx': `${glintX}%`,
      '--gy': `${glintY}%`,
      transition: 'transform 0.08s ease-out, box-shadow 0.2s ease',
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)',
      // @ts-ignore
      '--gx': '50%',
      '--gy': '30%',
      transition: 'transform 0.5s cubic-bezier(0.34, 1.45, 0.55, 1), box-shadow 0.4s ease',
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className={`glass-pane glass-rim will-change-transform cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}
