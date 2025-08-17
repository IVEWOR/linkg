"use client";
import React from "react";

export default function AnimatedBackground() {
  return (
    <>
      {/* Simple gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-0" />

      {/* Subtle green accent gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900/5 via-transparent to-green-800/5 pointer-events-none z-5" />
      <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-green-500/3 to-transparent pointer-events-none z-6" />

      {/* Single floating orb for subtle movement */}
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-green-500/5 to-green-400/5 rounded-full blur-3xl animate-float pointer-events-none z-7" />
    </>
  );
}
