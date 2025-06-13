import React, { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimationProps } from "framer-motion";

type CustomButtonProps = {
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  customAnimation?: (isHovered: boolean) => AnimationProps["animate"];
};

const CustomButton = ({
  text,
  icon,
  onClick,
  className,
  disabled,
  customAnimation,
}: CustomButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Default animation - moves icon 4px to the right on hover
  const defaultAnimation = (hovered: boolean) => ({ x: hovered ? 4 : 0 });

  return (
    <Button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "bg-violet-600 text-white w-fit flex items-center gap-1 hover:bg-violet-700 cursor-pointer",
        className,
      )}
      disabled={disabled}
    >
      {text}
      <motion.div
        animate={
          customAnimation
            ? customAnimation(isHovered)
            : defaultAnimation(isHovered)
        }
      >
        {icon}
      </motion.div>
    </Button>
  );
};

export default CustomButton;
