import { useEffect, useRef } from "react";

interface MatrixRainProps {
  className?: string;
}

const MatrixRain: React.FC<MatrixRainProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to container size
    const resizeCanvas = () => {
      if (canvas) {
        const container = canvas.parentElement;
        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
        }
      }
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Matrix characters
    const chars = "01";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    // Get CSS variable value for primary color
    const getPrimaryColor = (): string => {
      const primaryHue = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      return primaryHue ? `hsl(${primaryHue})` : "#00ff00"; // Fallback color
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      // Add semi-transparent black rectangle to create fade effect
      ctx.fillStyle = "rgba(9, 9, 11, 0.15)"; // Adjust opacity here (0.05 - 0.3)
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set the text style
      ctx.fillStyle = getPrimaryColor();
      ctx.font = `${fontSize}px monospace`;

      // Draw characters
      drops.forEach((drop, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drop * fontSize;

        ctx.fillText(text, x, y);

        // Reset position if drop reaches bottom or randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      });
    };

    // Animation loop
    const interval = setInterval(draw, 50); // Adjust speed here (16-50ms)

    // Cleanup
    return () => {
      clearInterval(interval);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full -z-10 ${className || ""}`}
      aria-hidden="true"
    />
  );
};

export default MatrixRain;
