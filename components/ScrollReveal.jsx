"use client";
import React, { useEffect, useRef, useState } from "react";

export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 50,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return "translate(0, 0)";

    switch (direction) {
      case "up":
        return `translate(0, ${distance}px)`;
      case "down":
        return `translate(0, -${distance}px)`;
      case "left":
        return `translate(${distance}px, 0)`;
      case "right":
        return `translate(-${distance}px, 0)`;
      default:
        return `translate(0, ${distance}px)`;
    }
  };

  return (
    <div
      ref={elementRef}
      className="transition-all duration-800 ease-out"
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}
