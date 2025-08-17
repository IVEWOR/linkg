"use client";
import React from "react";

export default function MouseFollower({ mousePosition }) {
  return (
    <>
      {/* Main cursor */}
      <div
        className="fixed w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full pointer-events-none z-50 mix-blend-screen transition-all duration-100 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: "translate(0, 0)",
        }}
      />

      {/* Trailing cursor */}
      <div
        className="fixed w-8 h-8 border-2 border-green-400/50 rounded-full pointer-events-none z-49 transition-all duration-200 ease-out"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
        }}
      />

      {/* Glow effect */}
      <div
        className="fixed w-32 h-32 bg-gradient-to-r from-green-500/20 to-green-400/20 rounded-full pointer-events-none z-0 blur-xl transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 64,
          top: mousePosition.y - 64,
        }}
      />

      {/* Outer ring */}
      <div
        className="fixed w-12 h-12 border border-green-300/30 rounded-full pointer-events-none z-48 transition-all duration-400 ease-out"
        style={{
          left: mousePosition.x - 24,
          top: mousePosition.y - 24,
        }}
      />
    </>
  );
}
