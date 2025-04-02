import { useEffect, useRef } from "react";

interface NetworkAnimationProps {
  desktopHouses: number;
  desktopPeople: number;
  mobileHouses: number;
  mobilePeople: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

class House implements Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  housePoints: { x: number; y: number }[];
  rotation: number;
  rotationSpeed: number;
  color: string;

  constructor(canvas: HTMLCanvasElement) {
    const colors = [
      'rgba(124, 58, 237, 0.5)',
      'rgba(236, 72, 153, 0.5)',
      'rgba(16, 185, 129, 0.5)',
    ];

    this.size = Math.random() * 0.5 + 0.5;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.housePoints = createHousePoints(0, 0, this.size);
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    const padding = 100;
    if (this.x < padding || this.x > window.innerWidth - padding) this.vx *= -1;
    if (this.y < padding || this.y > window.innerHeight - padding) this.vy *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Draw house base (square)
    ctx.beginPath();
    ctx.moveTo(this.housePoints[0].x, this.housePoints[0].y);
    ctx.lineTo(this.housePoints[1].x, this.housePoints[1].y);
    ctx.lineTo(this.housePoints[3].x, this.housePoints[3].y);
    ctx.lineTo(this.housePoints[4].x, this.housePoints[4].y);
    ctx.closePath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw roof (triangle)
    ctx.beginPath();
    ctx.moveTo(this.housePoints[1].x, this.housePoints[1].y);
    ctx.lineTo(this.housePoints[2].x, this.housePoints[2].y);
    ctx.lineTo(this.housePoints[3].x, this.housePoints[3].y);
    ctx.closePath();
    ctx.stroke();

    // Add windows
    const windowSize = 10 * this.size;
    ctx.fillStyle = this.color.replace('0.5', '0.2');
    // Left window
    ctx.fillRect(-windowSize * 1.5, windowSize/2, windowSize, windowSize);
    // Right window
    ctx.fillRect(windowSize * 0.5, windowSize/2, windowSize, windowSize);

    // Add a door
    const doorWidth = windowSize * 0.8;
    const doorHeight = windowSize * 1.5;
    ctx.fillStyle = this.color.replace('0.5', '0.2');
    ctx.fillRect(-doorWidth/2, this.housePoints[0].y - doorHeight, doorWidth, doorHeight);

    ctx.restore();
  }
}

class Person implements Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;

  constructor(canvas: HTMLCanvasElement) {
    const colors = [
      'rgba(59, 130, 246, 0.5)',
      'rgba(245, 158, 11, 0.5)',
      'rgba(147, 51, 234, 0.5)',
    ];

    this.size = Math.random() * 0.4 + 0.3;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    const padding = 100;
    if (this.x < padding || this.x > window.innerWidth - padding) this.vx *= -1;
    if (this.y < padding || this.y > window.innerHeight - padding) this.vy *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    // Draw stick figure
    ctx.arc(0, -10 * this.size, 8 * this.size, 0, Math.PI * 2); // Head
    ctx.moveTo(0, -2 * this.size);
    ctx.lineTo(0, 20 * this.size); // Body
    ctx.moveTo(-12 * this.size, 5 * this.size);
    ctx.lineTo(12 * this.size, 5 * this.size); // Arms
    ctx.moveTo(0, 20 * this.size);
    ctx.lineTo(-10 * this.size, 35 * this.size); // Left leg
    ctx.moveTo(0, 20 * this.size);
    ctx.lineTo(10 * this.size, 35 * this.size); // Right leg
    
    ctx.stroke();
    ctx.restore();
  }
}

function createHousePoints(x: number, y: number, size: number) {
  const baseSize = size * 30;
  return [
    { x: x - baseSize * 0.7, y: y + baseSize * 1.2 },
    { x: x - baseSize * 0.7, y: y },
    { x: x, y: y - baseSize * 0.7 },
    { x: x + baseSize * 0.7, y: y },
    { x: x + baseSize * 0.7, y: y + baseSize * 1.2 },
  ];
}

export function NetworkAnimation({ 
  desktopHouses = 10,
  desktopPeople = 10,
  mobileHouses = 7,
  mobilePeople = 7
}: NetworkAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Particle[] = [];
    const isMobile = window.innerWidth < 768;
    const houseCount = isMobile ? mobileHouses : desktopHouses;
    const peopleCount = isMobile ? mobilePeople : desktopPeople;

    // Create particles
    for (let i = 0; i < houseCount; i++) {
      particles.push(new House(canvas));
    }
    for (let i = 0; i < peopleCount; i++) {
      particles.push(new Person(canvas));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      const connectionDistance = 200;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.5;
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            
            gradient.addColorStop(0, particles[i].color.replace('0.5', String(opacity)));
            gradient.addColorStop(1, particles[j].color.replace('0.5', String(opacity)));
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [desktopHouses, desktopPeople, mobileHouses, mobilePeople]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full"
      style={{ 
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.8,
        mixBlendMode: 'multiply',
        background: 'transparent'
      }}
    />
  );
} 