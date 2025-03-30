import { useRef, useEffect, useState } from 'react';
import styles from './MouseEffect.module.css';
import gsap from 'gsap';

interface MouseEffectProps {
  children?: React.ReactNode;
  isNavItemHovered?: boolean;
  scrollProgress: number;
}

interface Dot {
  element: HTMLDivElement;
  x: number;
  y: number;
  scale: number;
  range: number;
  limit: number;
  angleX: number;
  angleY: number;
  angleSpeed: number;
  lockX?: number;
  lockY?: number;
}

export default function MouseEffect({ children, scrollProgress, isNavItemHovered = false }: MouseEffectProps) {
  const shapesRef = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<Dot[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFrameRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const amount = 10;
  const sineDots = Math.floor(amount * 0.3);
  const width = 26;

  useEffect(() => {
    // Create dots
    const newDots: Dot[] = Array.from({ length: amount }, (_, i) => {
      const dot = document.createElement('div');
      dot.className = styles.shape;
      shapesRef.current?.appendChild(dot);

      const scale = 1 - 0.05 * i;
      gsap.set(dot, { scale });

      return {
        element: dot,
        x: 0,
        y: 0,
        scale,
        range: width / 2 - width / 2 * scale + 2,
        limit: width * 0.75 * scale,
        angleX: Math.PI * 2 * Math.random(),
        angleY: Math.PI * 2 * Math.random(),
        angleSpeed: 0.05
      };
    });
    setDots(newDots);
  }, []);

  // Call resetIdleTimer after dots are set
  useEffect(() => {
    if (dots.length > 0) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({
          x: e.clientX,
          y: e.clientY
        });
        resetIdleTimer(e.clientX, e.clientY);
      };

      // Add event listener for mouse movement
      window.addEventListener('mousemove', handleMouseMove);
      lastFrameRef.current = Date.now();

      return () => {
        // Cleanup event listener and animations on component unmount
        window.removeEventListener('mousemove', handleMouseMove);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        dots.forEach(dot => dot.element.remove());
      };
    }
  }, [dots]);

  // Handle hover and scroll effects
  useEffect(() => {
    dots.forEach(dot => {
      // Calculate final scale based on hover and scroll state
      const finalScale = dot.scale * (isNavItemHovered ? 4 : 1) * (1 - scrollProgress * 0.5);
      gsap.to(dot.element, {
        scale: finalScale,
        duration: 0.5,
        ease: "power2.out"
      });
    });
  }, [dots, isNavItemHovered, scrollProgress]);

  // Reset idle timer and set idle state after timeout
  const resetIdleTimer = (x: number, y: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsIdle(false);
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      // Lock current positions of dots for idle animation
      dots.forEach(dot => {
        dot.lockX = x;  //dot.element.offsetLeft;
        dot.lockY = y; //dot.element.offsetTop;
      });
    }, 150);
  };

  useEffect(() => {
    const animate = () => {
      let x = mousePosition.x;
      let y = mousePosition.y;

      dots.forEach((dot, index) => {
        const nextDot = dots[index + 1] || dots[0];
        if (!isIdle || index <= sineDots) {
          // Active state: follow the cursor
          dot.x = x;
          dot.y = y;
          gsap.to(dot.element, { x: dot.x, y: dot.y, duration: 0.1, ease: "power2.out", overwrite: "auto" });
          // Calculate next position for trailing effect
          x += (nextDot.x - dot.x) * 0.3;
          y += (nextDot.y - dot.y) * 0.3;
        } else if (dot.lockX !== undefined && dot.lockY !== undefined) {
          // Idle state: floating animation
          dot.angleX += dot.angleSpeed;
          dot.angleY += dot.angleSpeed;
          dot.y = dot.lockY + Math.sin(dot.angleY) * dot.range;
          dot.x = dot.lockX + Math.sin(dot.angleX) * dot.range;
          gsap.to(dot.element, { x: dot.x, y: dot.y, duration: 0.1, ease: "power2.out", overwrite: "auto" });
        }
      });

      lastFrameRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      // Cleanup animation frame on component unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dots, mousePosition, isIdle]);

  return (
    <>
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -15" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>
      <div className={styles.mouseEffectContainer}>
        <div ref={shapesRef} className={styles.shapes} />
      </div>
    </>
  );
} 