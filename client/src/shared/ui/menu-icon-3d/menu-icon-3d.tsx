"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const ASCII_ON_DARK  = " .:-=+*#%@";
const ASCII_ON_LIGHT = "@%#*+:. ";

type Page = "home" | "about" | "projects" | "contact";

function createScene(page: Page): THREE.Group {
    const group = new THREE.Group();
    const mat = (color: string) =>
        new THREE.MeshStandardMaterial({ color, flatShading: true });

    if (page === "home") {
        const walls = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 1), mat("#6366f1"));
        walls.position.set(0, -0.15, 0);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.78, 0.72, 4, 1), mat("#4338ca"));
        roof.position.set(0, 0.62, 0);
        roof.rotation.y = Math.PI / 4;

        const door = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.4, 0.04), mat("#312e81"));
        door.position.set(0, -0.42, 0.51);

        group.add(walls, roof, door);
    }

    if (page === "about") {
        const arc = new THREE.Mesh(
            new THREE.TorusGeometry(0.36, 0.14, 4, 6, Math.PI * 1.45),
            mat("#7c3aed")
        );
        arc.position.set(0.05, 0.28, 0);
        arc.rotation.z -= 1.1;

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.38, 5), mat("#8b5cf6"));
        stem.position.set(0.18, -0.15, 0);

        const dot = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), mat("#6d28d9"));
        dot.position.set(0.18, -0.6, 0);

        group.add(arc, stem, dot);
    }

    if (page === "projects") {
        const top = new THREE.Mesh(
            new THREE.SphereGeometry(0.42, 8, 6, 0),
            mat("#eab308")
        );
        top.position.set(0, 0.1, 0);

        const neckPoints = [
            new THREE.Vector2(0.0, 0.0),   // низ цоколя
            new THREE.Vector2(0.14, -0.0),
            new THREE.Vector2(0.16, 0.1),
            new THREE.Vector2(0.12, 0.25),  // сужение перед колбой
            new THREE.Vector2(0.42, 0.5),   // стыкуется с экватором сферы
        ];

        const neck = new THREE.Mesh(
            new THREE.LatheGeometry(neckPoints, 8),
            mat("#ca8a04")
        );
        neck.position.set(0, -0.5, 0);

        const lamp = new THREE.Group();
        lamp.add(top, neck);
        lamp.rotation.x = Math.PI / 6;

        group.add(lamp);
    }

    if (page === "contact") {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.3, -0.6, 0),
            new THREE.Vector3(-0.6, -0.3, 0),
            new THREE.Vector3(-0.55, 0.1, 0),
            new THREE.Vector3(-0.2, 0.5, 0),
            new THREE.Vector3(0.15, 0.45, 0),
        ]);
        const tube = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 20, 0.12, 6, false),
            mat("#10b981")
        );
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.22, 5, 4), mat("#065f46"));
        ear.position.set(0.15, 0.45, 0);

        const mic = new THREE.Mesh(new THREE.SphereGeometry(0.22, 5, 4), mat("#065f46"));
        mic.position.set(-0.3, -0.6, 0);

        const phone = new THREE.Group();
        phone.add(tube, ear, mic);
        phone.rotation.z = Math.PI / 4;

        group.add(phone);
    }

    return group;
}

interface Props {
    page?: Page;
    cols?: number;
    fontSize?: number;
    className?: string;
}

export default function AsciiIcon3D({
    page = "home",
    cols = 60,
    fontSize = 10,
    className = "",
}: Props) {
    const asciiRef = useRef<HTMLPreElement>(null);
    const animRef  = useRef<number>(0);

    useEffect(() => {
        const W = cols * (fontSize * 0.55);
        const rows = Math.floor(cols * 0.45);
        const H = rows * fontSize;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setSize(W, H);
        renderer.setClearColor(0x000000, 0);

        const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
        camera.position.set(0, 0, 3);

        const scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0xffffff, 1.5));

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(4, 5, 3);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight2.position.set(-4, -2, -3);
        scene.add(dirLight2);

        const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight3.position.set(0, -5, 4);
        scene.add(dirLight3);

        const group = createScene(page);
        scene.add(group);

        const offscreen = document.createElement("canvas");
        offscreen.width  = cols;
        offscreen.height = rows;
        
        const ctx = offscreen.getContext("2d")!;

        let angle = 0;

        const render = () => {
            animRef.current = requestAnimationFrame(render);

            angle += 0.02;
            group.rotation.y = angle;

            renderer.render(scene, camera);

            ctx.clearRect(0, 0, cols, rows);
            ctx.drawImage(renderer.domElement, 0, 0, cols, rows);
            const imageData = ctx.getImageData(0, 0, cols, rows);

            // Выбираем набор символов под текущую тему
            // Читаем тему из DOM каждый кадр — мгновенно реагирует на смену темы
            const isDark = document.documentElement.classList.contains("dark");
            const chars = isDark ? ASCII_ON_DARK : ASCII_ON_LIGHT;

            let ascii = "";
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const i = (y * cols + x) * 4;
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    const a = imageData.data[i + 3];

                    if (a < 10) {
                        ascii += " ";
                    } else {
                        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                        const idx = Math.floor(brightness * (chars.length - 1));
                        ascii += chars[idx];
                    }
                }
                ascii += "\n";
            }

            if (asciiRef.current) {
                asciiRef.current.textContent = ascii;
            }
        };

        render();

        return () => {
            cancelAnimationFrame(animRef.current);
            renderer.dispose();
        };
    }, [page, cols, fontSize]);

    const PAGE_COLOR: Record<Page, string> = {
        home:     "currentColor",
        about:    "#5e62ff",
        projects: "#eab308",
        contact:  "#10b981",
    };

    return (
        <pre
            ref={asciiRef}
            className={className}
            style={{
                fontFamily: "monospace",
                fontSize: `${fontSize}px`,
                lineHeight: "1.0",
                letterSpacing: "0.05em",
                color: PAGE_COLOR[page],
                background: "transparent",
                margin: 0,
                padding: 0,
                whiteSpace: "pre",
                userSelect: "none",
            }}
        />
    );
}