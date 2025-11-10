// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type React from 'react';
import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }> = [];

    // Create particle
    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 240, // Purple to blue range
      };
    };

    // Initialize particles
    for (let i = 0; i < 100; i++) {
      particles.push(createParticle());
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary detection
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
        ctx.fill();

        // Connect nearby particles
        particles.slice(index + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${
              0.1 * (1 - distance / 100)
            })`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(139, 69, 255, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(75, 0, 130, 0.4) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #1a0033 25%, #2d1b69 50%, #000000 100%)
          `,
        }}
      />

      {/* Animated particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      />

      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(139, 69, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(75, 0, 130, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(138, 43, 226, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
