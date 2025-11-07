// src/components/CanvasBackground.tsx
import { useEffect, useRef } from "react";

type Props = {
  hue?: number;     // tono base del color
  density?: number; // cantidad de partículas
};

export default function CanvasBackground({ hue = 190, density = 140 }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Partículas ligeras (sin GSAP para evitar lag)
    const count = Math.floor((w * h) / (16000) + density); // escala con pantalla
    const pts: { x: number; y: number; r: number; vx: number; vy: number }[] =
      [];

    for (let i = 0; i < count; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      });
    }

    const draw = () => {
      // fondo negro transparente muy suave (deja ver el contenido)
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.0)";
      ctx.fillRect(0, 0, w, h);

      // puntos
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `hsla(${hue + (p.x / w) * 40}, 80%, 60%, 0.35)`;
        ctx.shadowColor = `hsla(${hue}, 90%, 60%, 0.25)`;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [hue, density]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        // IMPORTANTES: evita que quede detrás del body y respeta el stacking
        position: "fixed",
      }}
    />
  );
}
