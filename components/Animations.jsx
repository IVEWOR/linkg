"use client";
import React, { useState, useEffect } from "react";

import AnimatedBackground from "@/components/AnimatedBackground";
import MouseFollower from "@/components/MouseFollower";
import ParallaxSection from "@/components/ParallaxSection";

export default function Animations() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <AnimatedBackground />
      <MouseFollower mousePosition={mousePosition} />
      <ParallaxSection mousePosition={mousePosition} />
    </>
  );
}
