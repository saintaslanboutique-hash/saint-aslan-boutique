"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, useCallback, useEffect, useMemo, useTransition } from "react";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import shoes from "@/public/shoes.jpg";
import dress from "@/public/dress.jpg";
import jacket from "@/public/jacket.jpg";
import trousers from "@/public/trousers.jpg";
import contact from "@/public/contact.jpg";

const menuLinks = [
    { name: "Shoes", href: "/shoes", page: "shoes", img: shoes },
    { name: "Dress", href: "/dress", page: "dress", img: dress },
    { name: "Jacket", href: "/jacket", page: "jacket", img: jacket },
    { name: "Trousers", href: "/trousers", page: "trousers", img: trousers },
    { name: "Contact", href: "/contact", page: "contact", img: contact },
];

type Page = "shoes" | "dress" | "jacket" | "trousers" | "contact";



const dotStyles = `
  inline-block
  w-0 h-0 bg-black dark:bg-white rounded-full
  transition-all duration-500 ease-out
  mr-0
`;

const lockScroll = () => {
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflow = "hidden";
};

const unlockScroll = () => {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    document.documentElement.style.overflow = "";
};

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const openMenuRef = useRef<HTMLDivElement>(null);
    const menuContentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lineTopRef = useRef<SVGLineElement>(null);
    const lineBotRef = useRef<SVGLineElement>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isAnimatingRef = useRef(false);
    const [isPending, startTransition] = useTransition();
    const isNavigatingRef = useRef(false);
    const logoRef = useRef<HTMLSpanElement>(null);

    const activePage = useMemo(
        () => (menuLinks.find(l => l.href === pathname)?.page ?? "shoes") as Page,
        [pathname]
    );
    const [hoveredPage, setHoveredPage] = useState<Page | null>(null);
    const previewPage = hoveredPage ?? activePage;

    useGSAP(() => {
        containerRef.current = document.querySelector(".page-container") as HTMLDivElement;
    }, []);

    useEffect(() => {
        if (!logoRef.current) return;
        const shouldHide = pathname === "/contact" && !isMenuOpen;
        gsap.to(logoRef.current, {
            opacity: shouldHide ? 0 : 1,
            y: shouldHide ? -8 : 0,
            duration: 0.25,
            ease: shouldHide ? "power2.in" : "power2.out",
            overwrite: "auto",
        });
    }, [pathname, isMenuOpen]);

    useEffect(() => {
        if (isNavigatingRef.current) return;

        const lines = [lineTopRef.current, lineBotRef.current].filter(Boolean);

        gsap.killTweensOf(lines);
        gsap.killTweensOf(".menu-overlay");
        gsap.killTweensOf(menuContentRef.current);
        if (containerRef.current) gsap.killTweensOf(containerRef.current);

        gsap.set(lines, { clearProps: "all" });
        gsap.set(".menu-overlay", { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" });
        gsap.set(menuContentRef.current, { clearProps: "all" });
        if (containerRef.current) gsap.set(containerRef.current, { clearProps: "all" });

        unlockScroll();
        setTimeout(() => {
            setIsMenuOpen(false);
            setHoveredPage(null);
        }, 100);
        isAnimatingRef.current = false;
        isNavigatingRef.current = false;
    }, [pathname]);

    useEffect(() => {
        if (isNavigatingRef.current && !isPending) {
            isNavigatingRef.current = false;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    gsap.to(".menu-overlay", {
                        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                        duration: 0.7,
                        ease: "power4.inOut",
                        onComplete: () => {
                            isAnimatingRef.current = false;
                            setIsMenuOpen(false);
                        },
                    });
                });
            });
        }
    }, [isPending]);

    useEffect(() => {
        const lineTop = lineTopRef.current;
        const lineBot = lineBotRef.current;
        return () => {
            unlockScroll();
            const lines = [lineTop, lineBot].filter(Boolean);
            if (lines.length) gsap.killTweensOf(lines);
        };
    }, []);

    const handleMouseEnter = useCallback(() => {
        if (isMenuOpen || isAnimatingRef.current) return;
        gsap.to(lineTopRef.current, { scaleX: 1, transformOrigin: "left", duration: 0.3, ease: "power2.out", overwrite: "auto" });
        gsap.to(lineBotRef.current, { scaleX: 0.82, transformOrigin: "left", duration: 0.3, ease: "power2.out", overwrite: "auto" });
    }, [isMenuOpen]);

    const handleMouseLeave = useCallback(() => {
        if (isMenuOpen || isAnimatingRef.current) return;
        gsap.to([lineTopRef.current, lineBotRef.current], { scaleX: 1, transformOrigin: "left", duration: 0.3, ease: "power2.out", overwrite: "auto" });
    }, [isMenuOpen]);

    const handleLinkClick = useCallback((e: React.MouseEvent, href: string) => {
        e.preventDefault();
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        unlockScroll();
        setHoveredPage(null);

        gsap.to(".menu-link-icon", { opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(".menu-preview-img", { opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(".menu-link-item, .menu-social-item", {
            y: "120%", opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.in",
        });

        gsap.to(menuContentRef.current, {
            rotation: -15, x: -100, y: -100, scale: 1.5, opacity: 0.25,
            duration: 1.25, ease: "power4.inOut",
        });

        gsap.set([lineTopRef.current, lineBotRef.current], { clearProps: "all" });

        gsap.to(".menu-overlay", {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.7,
            ease: "power4.inOut",
            onComplete: () => {
                if (containerRef.current) {
                    gsap.set(containerRef.current, { clearProps: "all" });
                }
                gsap.set(menuContentRef.current, { clearProps: "all" });

                isNavigatingRef.current = true;
                startTransition(() => {
                    router.push(href);
                });
            },
        });
    }, [router]);

    const openMenu = useCallback(() => {
        if (isAnimatingRef.current || isMenuOpen) return;
        isAnimatingRef.current = true;

        lockScroll();

        gsap.killTweensOf([lineTopRef.current, lineBotRef.current]);
        gsap.set([lineTopRef.current, lineBotRef.current], { scaleX: 1 });

        if (containerRef.current) {
            gsap.to(containerRef.current, {
                rotation: 10, x: 300, y: 450, scale: 1.5,
                duration: 1.25, ease: "power4.inOut",
            });
        }

        gsap.to(lineTopRef.current, { scaleX: 1, y: 3, rotation: 45, transformOrigin: "center", duration: 0.5, ease: "power2.inOut" });
        gsap.to(lineBotRef.current, { scaleX: 1, y: -3, rotation: -45, transformOrigin: "center", duration: 0.5, ease: "power2.inOut" });

        gsap.to(menuContentRef.current, {
            rotation: 0, x: 0, y: 0, scale: 1, opacity: 1,
            duration: 1.25, ease: "power4.inOut",
        });

        gsap.to(".menu-link-item, .menu-social-item", {
            y: "0%", delay: 0.75, opacity: 1,
            duration: 1, stagger: 0.1, ease: "power3.out",
        });

        gsap.to(".menu-link-icon", {
            opacity: 1, delay: 0.75, duration: 0.8,
            stagger: 0.1, ease: "power3.out",
        });

        gsap.to(".menu-preview-img", {
            opacity: 1, delay: 0.9, duration: 0.9, ease: "power3.out",
        });

        gsap.to(".menu-overlay", {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)",
            duration: 1.25, ease: "power4.inOut",
            onComplete: () => {
                isAnimatingRef.current = false;
                setIsMenuOpen(true);
            },
        });
    }, [isMenuOpen]);

    const closeMenu = useCallback(() => {
        if (isAnimatingRef.current || !isMenuOpen) return;
        isAnimatingRef.current = true;

        unlockScroll();
        setHoveredPage(null);

        gsap.to(lineTopRef.current, { y: 0, rotation: 0, scaleX: 1, duration: 0.5, ease: "power2.inOut" });
        gsap.to(lineBotRef.current, { y: 0, rotation: 0, scaleX: 1, duration: 0.5, ease: "power2.inOut" });

        if (containerRef.current) {
            gsap.to(containerRef.current, {
                rotation: 0, x: 0, y: 0, scale: 1,
                duration: 1.25, ease: "power4.inOut",
            });
        }

        gsap.to(menuContentRef.current, {
            rotation: -15, x: -100, y: -100, scale: 1.5, opacity: 0.25,
            duration: 1.25, ease: "power4.inOut",
        });

        gsap.to(".menu-link-icon", {
            opacity: 0, duration: 0.4, ease: "power2.in",
        });

        gsap.to(".menu-preview-img", {
            opacity: 0, duration: 0.4, ease: "power2.in",
        });

        gsap.to(".menu-overlay", {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1.25, ease: "power4.inOut",
            onComplete: () => {
                isAnimatingRef.current = false;
                setIsMenuOpen(false);
            },
        });
    }, [isMenuOpen]);

    const toggleMenu = useCallback(() => {
        if (!isMenuOpen) openMenu();
        else closeMenu();
    }, [isMenuOpen, openMenu, closeMenu]);

    return (
        <>
            <nav className=" bg-transparent z-60">
                <div
                    className="relative w-12 h-6 cursor-pointer group"
                    onClick={toggleMenu}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <p ref={openMenuRef} className="absolute origin-top-left will-change-[transform,opacity]">
                        <svg width={32} height={32} viewBox="0 0 24 24" stroke="#000000" strokeWidth={1} strokeLinecap="round">
                            <line ref={lineTopRef} className="line-top" x1="0" y1="6" x2="22" y2="6" />
                            <line ref={lineBotRef} className="line-bot" x1="0" y1="12" x2="22" y2="12" />
                        </svg>
                    </p>
                </div>
            </nav>

            <div className="menu-overlay fixed inset-0 w-screen h-svh overflow-hidden bg-white z-50 text-black [clip-path:polygon(0%_0%,100%_0%,100%_0%,0%_0%)]">
                <div
                    ref={menuContentRef}
                    className="relative w-full h-full flex content-center items-center origin-left-bottom will-change-[transform,opacity]"
                    style={{ transform: "translateX(-100px) translateY(-100px) scale(1.5) rotate(-15deg)" }}
                >
                    <div className="w-full h-full flex items-center">
                        <div className="relative flex-1 flex w-full h-full">
                            <div className="flex-1 flex flex-col py-[2.5em] gap-[2.5em] w-full h-[130%] justify-center rounded-full absolute left-1/6 -top-1/6  z-10 bg-white">
                                <div className="rounded-2xl p-[1.5em] flex flex-col gap-[0.5em] items-start select-none">
                                    {menuLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        return (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={(e) => handleLinkClick(e, link.href)}
                                                className="menu-link-item inline-flex items-center will-change-transform transition-colors duration-500 text-[3.5rem] tracking-[-0.02em] group"
                                                style={{ transform: "translateY(120%)", opacity: 0.25 }}
                                                onMouseEnter={() => setHoveredPage(link.page as Page)}
                                                onMouseLeave={() => setHoveredPage(null)}
                                            >
                                                <span className={`${dotStyles} ${isActive
                                                    ? "opacity-100 scale-100 w-3 h-3 mr-4"
                                                    : "opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:w-3 group-hover:h-3 group-hover:mr-4"
                                                    }`} />

                                                <span className={isActive ? "font-medium" : ""}>
                                                    {link.name}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="menu-preview-img hidden md:block flex-1 relative h-full overflow-hidden opacity-0">
                            {menuLinks.map((link) => (
                                <div
                                    key={link.page}
                                    className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
                                    style={{ opacity: previewPage === link.page ? 1 : 0 }}
                                >
                                    <Image
                                        src={link.img}
                                        alt={link.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 0vw, 50vw"
                                    />
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}