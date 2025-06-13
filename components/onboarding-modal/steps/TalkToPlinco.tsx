"use client";

import React from "react";
import { motion } from "motion/react";
import {
  talkToPlincoAnimations,
  toolsConfig,
  toolAnimations,
  plincoBlob,
} from "./placeCallStepConfig";
import { CALL_STATUS, calculateBlobScale } from "@/lib/vapiUtils";

// Plinco Animated Tools Component
const PlincoAnimatedTools = () => {
  return (
    <>
      {toolsConfig.map((tool, index) => (
        <motion.div
          key={index}
          className={`absolute flex items-center justify-center w-12 h-12 ${tool.bgColor} ${tool.borderColor} backdrop-blur-sm rounded-lg shadow-lg border`}
          style={tool.position}
          initial={toolAnimations.initial}
          animate={toolAnimations.animate}
          transition={{
            ...toolAnimations.transition,
            delay: tool.delay,
          }}
        >
          <span className="text-lg">{tool.emoji}</span>
        </motion.div>
      ))}
    </>
  );
};

// Props interface for TalkToPlinco
interface TalkToPlincoProps {
  callStatus: CALL_STATUS;
  isSpeaking: boolean;
  volumeLevel: number;
}

// Talk to Plinco Component
export const TalkToPlinco = ({
  callStatus,
  isSpeaking,
  volumeLevel,
}: TalkToPlincoProps) => {
  // Calculate blob scale based on volume level and speaking state
  const getBlobScale = () => {
    return calculateBlobScale(callStatus, isSpeaking, volumeLevel);
  };

  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-center text-center relative"
      {...talkToPlincoAnimations}
    >
      {/* Main Plinco blob container */}
      <div className="relative flex items-center justify-center w-full h-48">
        <motion.div
          className="w-12 h-12 rounded-full shadow-md z-10"
          style={plincoBlob.style}
          animate={{
            ...plincoBlob.animate,
            scale: getBlobScale(),
          }}
          transition={{
            ...plincoBlob.transition,
            scale: {
              duration: 0.1,
              ease: "easeOut",
            },
          }}
        />

        {/* Animated tools */}
        <PlincoAnimatedTools />
      </div>
    </motion.div>
  );
};

export default TalkToPlinco;
