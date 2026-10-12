"use client";

import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import { MuseScene } from "./MuseScene";
import styles from "./AurelisExperience.module.css";

const chapters = [
  ["01 / Form", "Where scent becomes sculpture."],
  ["02 / Light", "Graphite reveals itself slowly."],
  ["03 / Anatomy", "A vessel, held in tension."],
  ["04 / Passage", "Move through the space within."],
  ["05 / Return", "The Muse — Graphite Edition."],
] as const;

export function AurelisExperience() {
  const storyRef = useRef<HTMLElement>(null);
  const progress = useRef({ value: 0 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const story = storyRef.current;
    if (!story) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      progress.current.value = 1;
      return;
    }

    const animation = gsap.to(progress.current, {
      value: 1,
      ease: "none",
      scrollTrigger: {
        trigger: story,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  return (
    <main>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Aurelis, top">
          AURELIS
        </a>
        <p>Parfums sculptés · MMXXVI</p>
      </header>

      <section ref={storyRef} id="top" className={styles.story}>
        <div className={styles.viewport} aria-hidden="true">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 1.55, 3.7], fov: 35, near: 0.1, far: 80 }}
            gl={{ antialias: true, powerPreference: "high-performance" }}
          >
            <MuseScene progress={progress} />
          </Canvas>
          <p className={styles.blockout}>3D blockout · Not final product design</p>
        </div>

        <div className={styles.chapters}>
          {chapters.map(([eyebrow, title], index) => (
            <section className={styles.chapter} key={eyebrow}>
              <div className={index % 2 ? styles.copyRight : styles.copyLeft}>
                <p className={styles.eyebrow}>{eyebrow}</p>
                {index === 0 ? (
                  <h1 className={styles.heroTitle}>{title}</h1>
                ) : (
                  <h2 className={styles.title}>{title}</h2>
                )}
                {index === 0 && (
                  <p className={styles.intro}>
                    An olfactory object shaped by shadow, stone and silver.
                  </p>
                )}
                {index === chapters.length - 1 && (
                  <p className={styles.edition}>Eau de parfum · 75 ml</p>
                )}
              </div>
              {index === 0 && (
                <p className={styles.scrollCue}>
                  <span /> Scroll to reveal
                </p>
              )}
            </section>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>A study in form, fragrance and fragmented classicism.</p>
        <p>Prototype 01 / AURELIS</p>
      </footer>
    </main>
  );
}
