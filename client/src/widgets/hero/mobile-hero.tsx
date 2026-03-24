"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const IMAGES = ["/hero_22.jpg", "/hero_33.jpg"];
const INTERVAL = 5000;
const FADE_DURATION_S = 0.85;

export default function MobileHero() {
    const [index, setIndex] = useState(0);
    const [fadeOpacity, setFadeOpacity] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const reducedMotionRef = useRef(false);
    const pendingAdvanceRef = useRef(false);

    useEffect(() => {
        reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    const finishFade = useCallback(() => {
        if (!pendingAdvanceRef.current) return;
        pendingAdvanceRef.current = false;
        setTransitionEnabled(false);
        setIndex((i) => (i + 1) % IMAGES.length);
        setFadeOpacity(0);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setTransitionEnabled(true));
        });
    }, []);

    useEffect(() => {
        const tick = () => {
            if (reducedMotionRef.current) {
                setIndex((i) => (i + 1) % IMAGES.length);
                return;
            }
            pendingAdvanceRef.current = true;
            setFadeOpacity(1);
        };
        const id = window.setInterval(tick, INTERVAL);
        return () => window.clearInterval(id);
    }, []);

    const nextIndex = (index + 1) % IMAGES.length;

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            <Link href="/products" className="absolute inset-0 z-0 block">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${IMAGES[index]})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                    }}
                />
                <div
                    className="absolute inset-0"
                    aria-hidden
                    onTransitionEnd={finishFade}
                    style={{
                        backgroundImage: `url(${IMAGES[nextIndex]})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        opacity: fadeOpacity,
                        transition: transitionEnabled
                            ? `opacity ${FADE_DURATION_S}s ease-in-out`
                            : "none",
                    }}
                />
            </Link>
        </div>
    );
}
