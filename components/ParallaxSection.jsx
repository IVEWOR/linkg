"use client";
import React from "react";

export default function ParallaxSection({ mousePosition }) {
  // Simple mouse parallax effect
  const mouseParallaxX =
    (mousePosition.x -
      (typeof window !== "undefined" ? window.innerWidth / 2 : 0)) *
    0.005;
  const mouseParallaxY =
    (mousePosition.y -
      (typeof window !== "undefined" ? window.innerHeight / 2 : 0)) *
    0.005;

  return (
    <div className="fixed inset-0 pointer-events-none -z-50">
      {/* Single subtle gradient that follows mouse */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-green-900/3 via-transparent to-green-800/3 -z-50"
        style={{
          transform: `translate(${mouseParallaxX * 10}px, ${
            mouseParallaxY * 10
          }px)`,
          transition: "transform 0.3s ease-out",
        }}
      />
    </div>
  );
}
