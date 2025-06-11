import React, { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type CustomButtonProps = {
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};

const CustomButton = ({
  text,
  icon,
  onClick,
  className,
  disabled,
}: CustomButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

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
      <motion.div animate={{ x: isHovered ? 4 : 0 }}>{icon}</motion.div>
    </Button>
  );
};

export default CustomButton;
