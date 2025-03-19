"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ColoredTextSegment = {
  text: string;
  color: string; // Can be a direct color value or a Tailwind class
};

export function ColourfulText({
  segments,
}: {
  segments: ColoredTextSegment[];
}) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // Just update the count to trigger re-renders for animation
    const interval = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {segments.map((segment, segmentIndex) => (
        <React.Fragment key={`segment-${segmentIndex}`}>
          {segment.text.split("").map((char, charIndex) => {
            const globalIndex = segments
              .slice(0, segmentIndex)
              .reduce((acc, curr) => acc + curr.text.length, 0) + charIndex;
            
            // Check if the color is a Tailwind class (starts with "text-")
            const isTailwindClass = segment.color.startsWith("text-");
            
            return (
              <motion.span
                key={`${char}-${count}-${globalIndex}`}
                initial={{
                  y: 0,
                }}
                animate={{
                  // Only set color directly if it's not a Tailwind class
                  ...(isTailwindClass ? {} : { color: segment.color }),
                  y: [0, -3, 0],
                  scale: [1, 1.01, 1],
                  filter: ["blur(0px)", `blur(5px)`, "blur(0px)"],
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  duration: 0.5,
                  delay: globalIndex * 0.05,
                }}
                className={cn(
                  "inline-block whitespace-pre tracking-tighter",
                  // Apply Tailwind class if it is one
                  isTailwindClass ? segment.color : ""
                )}
              >
                {char}
              </motion.span>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
}

// For backward compatibility
export function LegacyColourfulText({ text }: { text: string }) {
  const colors = [
    "rgb(239 68 68)",
    "rgb(234 179 8)",
    "rgb(34 197 94)",
    "rgb(59 130 246)",
  ];

  const [currentColors, setCurrentColors] = React.useState(colors);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...colors].sort(() => Math.random() - 0.5);
      setCurrentColors(shuffled);
      setCount((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return text.split("").map((char, index) => (
    <motion.span
      key={`${char}-${count}-${index}`}
      initial={{
        y: 0,
      }}
      animate={{
        color: currentColors[index % currentColors.length],
        y: [0, -3, 0],
        scale: [1, 1.01, 1],
        filter: ["blur(0px)", `blur(5px)`, "blur(0px)"],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
      }}
      className="inline-block whitespace-pre tracking-tighter"
    >
      {char}
    </motion.span>
  ));
}
