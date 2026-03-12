"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

const IMAGES = ["/hero.png", "/hero3.png"];
const SQUARE_SIZE = 200; 
const INTERVAL = 5000;

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [nextIdx, setNextIdx] = useState(1);
    const [grid, setGrid] = useState({ cols: 0, rows: 0 });
    const isAnimating = useRef(false);

    const calcGrid = useCallback(() => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;
        setGrid({
            cols: Math.ceil(clientWidth / SQUARE_SIZE),
            rows: Math.ceil(clientHeight / SQUARE_SIZE),
        });
    }, []);

    useEffect(() => {
        calcGrid();
        window.addEventListener("resize", calcGrid);
        return () => window.removeEventListener("resize", calcGrid);
    }, [calcGrid]);

    const runTransition = useCallback(() => {
        if (isAnimating.current || grid.cols === 0) return;
        
        const squares = containerRef.current?.querySelectorAll(".sq");
        if (!squares) return;

        isAnimating.current = true;

        const tl = gsap.timeline({
            onComplete: () => {
                // Update the background image of the base layer
                setCurrentIdx(nextIdx);
                setNextIdx((prev) => (prev + 1) % IMAGES.length);
                
                // Reset squares for the next cycle
                gsap.set(squares, { opacity: 0, scale: 0 });
                isAnimating.current = false;
            }
        });

        tl.to(squares, {
            opacity: 1,
            scale: 1.01, // Slight overlap (1.01) prevents tiny gaps between squares
            duration: 0.7,
            stagger: {
                amount: 0.7,
                from: "random",
            },
            ease: "power2.inOut",
        });
    }, [grid, nextIdx]);

    useEffect(() => {
        const timer = setInterval(runTransition, INTERVAL);
        return () => clearInterval(timer);
    }, [runTransition]);

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
            {/* Base Image: Using CSS Background instead of Next Image */}
            <div 
                className="absolute inset-0 z-0 transition-none scale-0.98"
                style={{
                    backgroundImage: `url(${IMAGES[currentIdx]})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    
                }}
            />

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 z-10 pointer-events-none grid"
                style={{
                    gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                }}
            >
                {Array.from({ length: grid.cols * grid.rows }).map((_, i) => {
                    const col = i % grid.cols;
                    const row = Math.floor(i / grid.cols);
                    
                    // The secret sauce: 
                    // We calculate the percentage position based on the grid index
                    const xPerc = grid.cols > 1 ? (col / (grid.cols - 1)) * 100 : 0;
                    const yPerc = grid.rows > 1 ? (row / (grid.rows - 1)) * 100 : 0;

                    return (
                        <div
                            key={`${grid.cols}-${i}`}
                            className="sq w-full h-full"
                            style={{
                                backgroundImage: `url(${IMAGES[nextIdx]})`,
                                // Match the 'cover' behavior exactly
                                backgroundSize: `${grid.cols * 100.1}% ${grid.rows * 100.1}%`,
                                backgroundPosition: `${xPerc}% ${yPerc}%`,
                                opacity: 0,
                                transform: "scale(0)",
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}