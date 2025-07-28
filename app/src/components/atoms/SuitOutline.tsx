import ClubsOutlineImg from "../../assets/other/clubs_outline.svg";
import DiamondsOutlineImg from "../../assets/other/diamond_outline.svg";
import HeartsOutlineImg from "../../assets/other/hearts_outline.svg";
import SpadesOutlineImg from "../../assets/other/spade_outline.svg";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

// Suit type constants for better type safety
export const SuitType = {
  CLUBS: "CLUBS",
  DIAMONDS: "DIAMONDS", 
  HEARTS: "HEARTS",
  SPADES: "SPADES",
} as const;

export type SuitTypeValue = (typeof SuitType)[keyof typeof SuitType];

// Suit outline images mapping
const SUIT_OUTLINES = {
  CLUBS: ClubsOutlineImg,
  DIAMONDS: DiamondsOutlineImg,
  HEARTS: HeartsOutlineImg,
  SPADES: SpadesOutlineImg,
};

// Main SuitOutline component
interface SuitOutlineProps {
  suitType: SuitTypeValue;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SuitOutline: React.FC<SuitOutlineProps> = ({
  suitType,
  className = "",
  size = "md",
}) => {
  const [currentSuit, setCurrentSuit] = useState(suitType);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      // On first render, set the initial state without animation
      setCurrentSuit(suitType);
      setIsInitialized(true);
    } else if (currentSuit !== suitType) {
      // Only animate if the suit actually changes after initialization
      setCurrentSuit(suitType);
    }
  }, [suitType, isInitialized, currentSuit]);

  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
  };

  const suitImage = SUIT_OUTLINES[currentSuit];

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSuit}
          src={suitImage}
          alt={`${currentSuit.toLowerCase()} outline`}
          className="w-full h-full object-contain"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </AnimatePresence>
    </div>
  );
};
