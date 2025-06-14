// Animation Configurations
export const phoneInputAnimations = {
  initial: { y: 10, opacity: 0, scale: 0.9 },
  animate: { y: 0, opacity: 0.7, scale: 1 },
  exit: { y: -150, opacity: 0, scale: 0.7 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

export const talkToPlincoAnimations = {
  initial: { y: 100, opacity: 0.6, scale: 0.6 },
  animate: { y: 0, opacity: 1, scale: 1 },
  exit: { y: -150, opacity: 0, scale: 0.7 },
  transition: { duration: 0.4, ease: "easeInOut" },
};

export const toolAnimations = {
  initial: { opacity: 0, scale: 0.3, y: 10 },
  animate: { opacity: 0.7, scale: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

// Tools Configuration
export const toolsConfig = [
  {
    emoji: "📞",
    position: { top: "5%", left: "30%" },
    delay: 0.5,
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  {
    emoji: "⚡",
    position: { top: "1%", right: "20%" },
    delay: 0.8,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    emoji: "⚙️",
    position: { bottom: "12%", left: "20%" },
    delay: 1.1,
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
  },
  {
    emoji: "💻",
    position: { bottom: "1%", right: "25%" },
    delay: 1.4,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    emoji: "🚀",
    position: { top: "20%", left: "0%" },
    delay: 1.7,
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
  },
  {
    emoji: "💬",
    position: { top: "45%", right: "0%" },
    delay: 2.0,
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
  },
];

// Main Plinco blob animation styles
export const plincoBlob = {
  style: {
    background:
      "linear-gradient(45deg, #8b5cf6, #3b82f6, #6366f1, #1e40af, #8b5cf6)",
    backgroundSize: "300% 300%",
    willChange: "transform, background-position",
  },
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    rotate: [0, 360],
  },
  transition: {
    backgroundPosition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
    rotate: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Container styles
export const containerStyles = {
  backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
  backgroundSize: "16px 16px",
};
