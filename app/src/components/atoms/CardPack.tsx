import CardPack1Img from "../../assets/packs/pack_1.png";
import CardPack2Img from "../../assets/packs/pack_2.png";
import CardPack3Img from "../../assets/packs/pack_3.png";
import CardPack4Img from "../../assets/packs/pack_4.png";
import CardPack5Img from "../../assets/packs/pack_5.png";
import CardPack6Img from "../../assets/packs/pack_6.png";
import CardPack7Img from "../../assets/packs/pack_7.png";
import CardPack8Img from "../../assets/packs/pack_8.png";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

// Card pack images array
const CARD_PACKS = [
  CardPack1Img,
  CardPack2Img,
  CardPack3Img,
  CardPack4Img,
  CardPack5Img,
  CardPack6Img,
  CardPack7Img,
  CardPack8Img,
];

// Legacy export for backward compatibility
export const CARD_PACK = CARD_PACKS;

// Image wrapper component for card packs
interface CardPackImageProps {
  count: number;
  className?: string;
  alt?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const CardPackImage: React.FC<CardPackImageProps> = ({
  count,
  className = "",
  alt = "Card pack",
  onClick,
  disabled = false,
}) => {
  const packImage = CARD_PACKS[count - 1] || CARD_PACKS[0]; // Default to first pack if count is out of bounds

  return (
    <img
      src={packImage}
      alt={alt}
      className={`transition-all duration-200 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:scale-105"
      } ${className}`}
      onClick={disabled ? undefined : onClick}
    />
  );
};

// Main CardPack component
interface CardPackProps {
  count: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
  remainingCards?: number;
}

export const CardPack: React.FC<CardPackProps> = ({
  count,
  className = "",
  onClick,
  disabled = false,
  size = "md",
  showAnimation = true,
  remainingCards,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentCount, setCurrentCount] = useState(count);

  // Handle count changes with animation
  useEffect(() => {
    if (currentCount !== count && showAnimation) {
      setIsFlipping(true);

      // Sequential animation: flip → wait → change → flip back
      const flipTimer = setTimeout(() => {
        // After 300ms, change the image
        setCurrentCount(count);

        // Wait 50ms, then flip back
        const flipBackTimer = setTimeout(() => {
          setIsFlipping(false);
        }, 50);

        return () => clearTimeout(flipBackTimer);
      }, 300);

      return () => clearTimeout(flipTimer);
    } else if (currentCount !== count) {
      // If animation is disabled, change immediately
      setCurrentCount(count);
    }
  }, [count, currentCount, showAnimation]);

  const sizes = {
    sm: "w-16 h-20",
    md: "w-20 h-24",
    lg: "w-24 h-28",
  };

  const packVariants = {
    initial: { scale: 1, rotateY: 0 },
    hover: { scale: 1.05, rotateY: 0 },
    tap: { scale: 0.95, rotateY: 0 },
    flip: { rotateY: 90 },
  };

  return (
    <div
      className={`relative ${sizes[size]} ${className}`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="w-full h-full"
        initial="initial"
        animate={
          isFlipping ? "flip" : isHovered && showAnimation ? "hover" : "initial"
        }
        whileTap={showAnimation ? "tap" : "initial"}
        variants={packVariants}
        transition={{
          duration: isFlipping ? 0.3 : 0.2,
          ease: isFlipping ? "linear" : "easeInOut",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{ transformStyle: "preserve-3d" }}
      >
        <CardPackImage
          count={currentCount}
          className="w-full h-full object-contain"
          onClick={onClick}
          disabled={disabled}
        />

        {/* Remaining cards indicator */}
        {remainingCards !== undefined && remainingCards > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {remainingCards}
          </div>
        )}
      </motion.div>
    </div>
  );
};
