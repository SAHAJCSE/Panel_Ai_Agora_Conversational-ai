'use client';

import { useEffect, useRef } from 'react';

export function AgentOrbCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;

    function resize() {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    function render() {
      time += 0.022;
      ctx!.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.44;

      if (radius <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Base Dark Cosmic Core
      const coreGradient = ctx!.createRadialGradient(
        centerX - radius * 0.25,
        centerY - radius * 0.25,
        radius * 0.1,
        centerX,
        centerY,
        radius,
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.18, '#ec4899');
      coreGradient.addColorStop(0.45, '#a855f7');
      coreGradient.addColorStop(0.75, '#3b0764');
      coreGradient.addColorStop(1, '#050508');

      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx!.fillStyle = coreGradient;
      ctx!.fill();

      // Swirling Nebula Plasma Lines inside
      ctx!.globalCompositeOperation = 'screen';
      for (let i = 0; i < 4; i++) {
        ctx!.beginPath();
        const angleOffset = (i * Math.PI) / 2 + time * 0.6;
        const rx = radius * (0.8 + 0.15 * Math.sin(time + i));
        const ry = radius * (0.45 + 0.2 * Math.cos(time * 0.8 + i));
        ctx!.ellipse(centerX, centerY, rx, ry, angleOffset, 0, Math.PI * 2);

        const plasmaGrad = ctx!.createLinearGradient(
          centerX - rx,
          centerY - ry,
          centerX + rx,
          centerY + ry,
        );
        plasmaGrad.addColorStop(0, 'rgba(236, 72, 153, 0.7)');
        plasmaGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
        plasmaGrad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

        ctx!.strokeStyle = plasmaGrad;
        ctx!.lineWidth = 14 + 6 * Math.sin(time + i);
        ctx!.stroke();
      }

      // Inner glowing core pulse
      const innerGlow = ctx!.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius * 0.5,
      );
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      innerGlow.addColorStop(0.3, 'rgba(236, 72, 153, 0.5)');
      innerGlow.addColorStop(1, 'transparent');
      ctx!.fillStyle = innerGlow;
      ctx!.beginPath();
      ctx!.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.restore();
      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
