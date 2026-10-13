'use client';

import { useEffect, useRef } from 'react';

/** Subtiele zwevende sterretjes op een canvas. Respecteert "reduced motion". */
export default function Particles({ color }: { color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    type Dot = { x: number; y: number; r: number; vx: number; vy: number; a: number };
    let dots: Dot[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (w * h) / 14000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.25 - 0.05,
        a: Math.random(),
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const d of dots) {
        if (!reduce) {
          d.x += d.vx;
          d.y += d.vy;
          d.a += 0.012;
          if (d.y < -4) d.y = h + 4;
          if (d.x < -4) d.x = w + 4;
          if (d.x > w + 4) d.x = -4;
        }
        ctx.globalAlpha = 0.25 + 0.6 * Math.abs(Math.sin(d.a));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 -z-10 h-full w-full" aria-hidden />;
}
