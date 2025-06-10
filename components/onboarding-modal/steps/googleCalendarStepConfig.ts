import { RefObject } from "react";
import googleCalendarIcon from "@/public/images/google-calendar-icon.png";
import plincoLogo from "@/public/images/plinco-logo.png";

// Container styling configuration
export const containerStyles = {
  backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
  backgroundSize: "16px 16px",
};

// Image configurations
export const IMAGE_SIZE = 56;

export const googleCalendarImageProps = {
  src: googleCalendarIcon,
  className: "object-contain",
  alt: "Google Calendar Logo",
  width: IMAGE_SIZE,
  height: IMAGE_SIZE,
};

export const plincoImageProps = {
  src: plincoLogo,
  className: "object-contain rounded-[6px]",
  alt: "Plinco Logo",
  width: IMAGE_SIZE,
  height: IMAGE_SIZE,
};

// Beam configurations
export const BEAM_CURVATURE = 70;
export const BEAM_Y_OFFSET = 10;

// Google brand colors
export const GOOGLE_COLORS = {
  red: "#EA4335",
  blue: "#4285F4",
  yellow: "#FBBC05",
  green: "#34A853",
};

// Beam config factory functions (since they need refs)
export const createUpperBeamConfig = (
  containerRef: RefObject<HTMLDivElement | null>,
  googleCalendarRef: RefObject<HTMLDivElement | null>,
  plincoRef: RefObject<HTMLDivElement | null>,
) => ({
  containerRef,
  fromRef: googleCalendarRef,
  toRef: plincoRef,
  startYOffset: BEAM_Y_OFFSET,
  endYOffset: BEAM_Y_OFFSET,
  curvature: -BEAM_CURVATURE,
  gradientStartColor: GOOGLE_COLORS.red,
  gradientStopColor: GOOGLE_COLORS.blue,
});

export const createLowerBeamConfig = (
  containerRef: RefObject<HTMLDivElement | null>,
  googleCalendarRef: RefObject<HTMLDivElement | null>,
  plincoRef: RefObject<HTMLDivElement | null>,
) => ({
  containerRef,
  fromRef: plincoRef,
  toRef: googleCalendarRef,
  startYOffset: -BEAM_Y_OFFSET,
  endYOffset: -BEAM_Y_OFFSET,
  curvature: BEAM_CURVATURE,
  reverse: true,
  gradientStartColor: GOOGLE_COLORS.yellow,
  gradientStopColor: GOOGLE_COLORS.green,
});
