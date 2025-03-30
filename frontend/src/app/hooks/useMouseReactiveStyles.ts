import { useRef, useEffect, RefObject } from 'react';
import gsap from 'gsap';

/**
 * Custom hook to apply mouse-reactive styles (shadow, skew) to a container element.
 * @param containerRef - A React ref object pointing to the container HTMLDivElement.
 */
export function useMouseReactiveStyles(containerRef: RefObject<HTMLDivElement>) {
    // Ref to hold the current smoothed mouse coordinates for GSAP animation
    const smoothedMouseRef = useRef({ x: 0, y: 0 });

    // Effect to set initial mouse position and handle movement/shadow/skew animation
    useEffect(() => {
        // Ensure ref is current and we are in a browser environment
        if (!containerRef.current || typeof window === 'undefined') return;

        // Set initial position to center only on the client
        smoothedMouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        const animationTarget = smoothedMouseRef.current; // GSAP will tween the x/y properties

        const updateDynamicStyles = () => {
            if (!containerRef.current) return;

            // Calculate everything based on the current smoothed mouse position
            const { x: smoothedX, y: smoothedY } = animationTarget;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const deltaX = smoothedX - centerX;
            const deltaY = smoothedY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
            let normalizedDistance = maxDist === 0 ? 0 : Math.min(distance / maxDist, 1);
            normalizedDistance = Math.pow(normalizedDistance, 2); // Apply curve

            // --- Shadow Calculations ---
            const maxBlur = 5;
            const blurRadius = maxBlur * normalizedDistance;
            const maxOffsetIncrease = 20;
            const baseOffsetX = 2;
            const totalOffsetXMagnitude = baseOffsetX + maxOffsetIncrease * normalizedDistance;
            const baseOffsetY = 3;
            const totalOffsetYMagnitude = baseOffsetY + maxOffsetIncrease * normalizedDistance;

            let finalOffsetX = totalOffsetXMagnitude;
            let finalOffsetY = totalOffsetYMagnitude;
            let normDirectionX = 0;
            let normDirectionY = 0;

            if (distance > 0.1) {
                normDirectionX = -deltaX / distance;
                normDirectionY = -deltaY / distance;
                finalOffsetX = totalOffsetXMagnitude * normDirectionX;
                finalOffsetY = totalOffsetYMagnitude * normDirectionY;
            }

            // Update CSS variables for shadow
            containerRef.current.style.setProperty('--text-shadow-blur-radius', `${blurRadius}px`);
            containerRef.current.style.setProperty('--text-shadow-offset-x', `${finalOffsetX}px`);
            containerRef.current.style.setProperty('--text-shadow-offset-y', `${finalOffsetY}px`);

            // --- Skew Calculations ---
            const maxSkew = 3; // Max skew angle in degrees

            // Avoid division by zero if window dimensions are zero
            const deltaXRatio = centerX === 0 ? 0 : Math.abs(deltaX / centerX);
            const deltaYRatio = centerY === 0 ? 0 : Math.abs(deltaY / centerY);


            const skewSign = Math.sign(deltaX) * Math.sign(deltaY) >= 0 ? -1 : 1; // Simpler sign check
            const skewMagnitude = Math.min(deltaYRatio, deltaXRatio);
            const skew = maxSkew * skewMagnitude * skewSign;


            // Apply skew transform
            containerRef.current.style.transform = `skew(${skew}deg)`;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Animate the smoothed mouse position values
            gsap.to(animationTarget, {
                x: mouseX,
                y: mouseY,
                duration: 0.8,
                ease: 'power1.out',
                overwrite: 'auto',
                onUpdate: updateDynamicStyles // Call the update function during animation
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Initialize styles on mount
        updateDynamicStyles();

        // Store the current ref for cleanup to avoid issues if the ref changes
        const currentRef = containerRef.current;

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            gsap.killTweensOf(animationTarget);
            // Reset CSS variables and transform using the stored ref
            if (currentRef) {
               currentRef.style.removeProperty('--text-shadow-blur-radius');
               currentRef.style.removeProperty('--text-shadow-offset-x');
               currentRef.style.removeProperty('--text-shadow-offset-y');
               currentRef.style.transform = 'none'; // Reset transform
            }
        };
    }, [containerRef]); // Re-run the effect if the containerRef itself changes
} 