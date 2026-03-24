"use client";

import gsap from "gsap";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/src/shared/lib/intro-context";
import { INTRO_MOBILE_LOGO_FONT_PX, LOGO_CONTAINER_LAYOUT_ID } from "./logo-layout-id";

/** Smaller, slower reveal — no scan cursor (easier to follow on small screens). */
const REVEAL_DURATION = 0.85;
const PHASE2_START = 0.95;

export function MobileIntroLoader() {
  const { introDone, titleInNavbar, setTitleInNavbar } = useIntro();
  const containerRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ value: 0 });
  const [inverted, setInverted] = useState(false);

  useEffect(() => {
    if (titleInNavbar) return;
    const el = containerRef.current;
    const revealEl = revealRef.current;
    if (!el) return;

    const tl = gsap.timeline();

    tl.fromTo(
      el,
      { opacity: 0, filter: "blur(8px)" },
      { opacity: 1, filter: "blur(0px)", duration: 0.65, ease: "power2.out" }
    );

    tl.to(
      progressRef.current,
      {
        value: 1,
        duration: REVEAL_DURATION,
        ease: "power2.inOut",
        onUpdate: () => {
          const p = progressRef.current.value;
          const right = 100 - p * 100;
          if (revealEl) {
            revealEl.style.clipPath = `inset(0 ${right}% 0 0)`;
          }
        },
        onComplete: () => setInverted(true),
      },
      PHASE2_START
    );

    tl.add(() => setTitleInNavbar(true), PHASE2_START + REVEAL_DURATION);

    return () => {
      tl.kill();
    };
  }, [titleInNavbar, setTitleInNavbar]);

  if (introDone) {
    return null;
  }

  const textClass =
    "font-bold uppercase tracking-tight whitespace-nowrap text-center";
  const textStyle = {
    fontSize: INTRO_MOBILE_LOGO_FONT_PX,
    textAlign: "center" as const,
    fontFamily: "var(--font-michroma)",
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[#1c1d1d] flex items-center justify-center"
      initial={false}
      animate={{ opacity: titleInNavbar ? 0 : 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ pointerEvents: titleInNavbar ? "none" : "auto" }}
    >
      {!titleInNavbar && (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <motion.div
            ref={containerRef}
            layoutId={LOGO_CONTAINER_LAYOUT_ID}
            className={`flex items-center justify-center px-4 py-2 z-50 ${
              inverted ? "bg-white" : "bg-transparent"
            }`}
            transition={{
              type: "spring",
              stiffness: 52,
              damping: 26,
              mass: 0.85,
            }}
          >
            {inverted ? (
              <motion.span
                layout
                className={`${textClass} text-black`}
                style={textStyle}
              >
                SAINT ASLAN
              </motion.span>
            ) : (
              <div className="relative inline-flex items-center justify-center">
                <span
                  className={`${textClass} text-white`}
                  style={textStyle}
                  aria-hidden
                >
                  SAINT ASLAN
                </span>
                <div
                  ref={revealRef}
                  className="absolute inset-0 flex items-center justify-center bg-white"
                  style={{ clipPath: "inset(0 100% 0 0)" }}
                  aria-hidden
                >
                  <span className={`${textClass} text-black`} style={textStyle}>
                    SAINT ASLAN
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
