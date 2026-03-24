"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const IMAGES = ["/hero_22.jpg", "/hero_33.jpg"];
const INTERVAL = 5000;
const FADE_DURATION_S = 0.85;

export default function MobileHero() {
    const [index, setIndex] = useState(0);
    const [fadeOpacity, setFadeOpacity] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const reducedMotionRef = useRef(false);
    const pendingAdvanceRef = useRef(false);
    const t = useTranslations("hero");

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
                <div className="absolute inset-0 z-10 flex items-center justify-center px-6 bg-black/30">
                    <span
                        className="mobile-hero-cta font-michroma text-center text-[0.85rem] uppercase leading-relaxed tracking-[0.42em] text-white/50 sm:text-xs"
                        style={{
                            textShadow:
                                "0 1px 0 rgba(255,255,255,0.12), 0 0 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.35)",
                        }}
                    >
                        {t("button")}
                    </span>
                </div>
            </Link>
        </div>
    );
}
