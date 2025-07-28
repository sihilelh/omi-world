import Clubs7Img from "../../assets/cards/7_of_clubs.svg";
import Clubs8Img from "../../assets/cards/8_of_clubs.svg";
import Clubs9Img from "../../assets/cards/9_of_clubs.svg";
import Clubs10Img from "../../assets/cards/10_of_clubs.svg";
import ClubsJackImg from "../../assets/cards/jack_of_clubs.svg";
import ClubsQueenImg from "../../assets/cards/queen_of_clubs.svg";
import ClubsKingImg from "../../assets/cards/king_of_clubs.svg";
import ClubsAceImg from "../../assets/cards/ace_of_clubs.svg";

import Diamonds7Img from "../../assets/cards/7_of_diamonds.svg";
import Diamonds8Img from "../../assets/cards/8_of_diamonds.svg";
import Diamonds9Img from "../../assets/cards/9_of_diamonds.svg";
import Diamonds10Img from "../../assets/cards/10_of_diamonds.svg";
import DiamondsJackImg from "../../assets/cards/jack_of_diamonds.svg";
import DiamondsQueenImg from "../../assets/cards/queen_of_diamonds.svg";
import DiamondsKingImg from "../../assets/cards/king_of_diamonds.svg";
import DiamondsAceImg from "../../assets/cards/ace_of_diamonds.svg";

import Hearts7Img from "../../assets/cards/7_of_hearts.svg";
import Hearts8Img from "../../assets/cards/8_of_hearts.svg";
import Hearts9Img from "../../assets/cards/9_of_hearts.svg";
import Hearts10Img from "../../assets/cards/10_of_hearts.svg";
import HeartsJackImg from "../../assets/cards/jack_of_hearts.svg";
import HeartsQueenImg from "../../assets/cards/queen_of_hearts.svg";
import HeartsKingImg from "../../assets/cards/king_of_hearts.svg";
import HeartsAceImg from "../../assets/cards/ace_of_hearts.svg";

import Spades7Img from "../../assets/cards/7_of_spades.svg";
import Spades8Img from "../../assets/cards/8_of_spades.svg";
import Spades9Img from "../../assets/cards/9_of_spades.svg";
import Spades10Img from "../../assets/cards/10_of_spades.svg";
import SpadesJackImg from "../../assets/cards/jack_of_spades.svg";
import SpadesQueenImg from "../../assets/cards/queen_of_spades.svg";
import SpadesKingImg from "../../assets/cards/king_of_spades.svg";
import SpadesAceImg from "../../assets/cards/ace_of_spades.svg";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

// Card type constants for better type safety
export const CardType = {
  // Clubs
  CLUBS_7: "CLUBS_7",
  CLUBS_8: "CLUBS_8",
  CLUBS_9: "CLUBS_9",
  CLUBS_10: "CLUBS_10",
  CLUBS_JACK: "CLUBS_JACK",
  CLUBS_QUEEN: "CLUBS_QUEEN",
  CLUBS_KING: "CLUBS_KING",
  CLUBS_ACE: "CLUBS_ACE",

  // Diamonds
  DIAMONDS_7: "DIAMONDS_7",
  DIAMONDS_8: "DIAMONDS_8",
  DIAMONDS_9: "DIAMONDS_9",
  DIAMONDS_10: "DIAMONDS_10",
  DIAMONDS_JACK: "DIAMONDS_JACK",
  DIAMONDS_QUEEN: "DIAMONDS_QUEEN",
  DIAMONDS_KING: "DIAMONDS_KING",
  DIAMONDS_ACE: "DIAMONDS_ACE",

  // Hearts
  HEARTS_7: "HEARTS_7",
  HEARTS_8: "HEARTS_8",
  HEARTS_9: "HEARTS_9",
  HEARTS_10: "HEARTS_10",
  HEARTS_JACK: "HEARTS_JACK",
  HEARTS_QUEEN: "HEARTS_QUEEN",
  HEARTS_KING: "HEARTS_KING",
  HEARTS_ACE: "HEARTS_ACE",

  // Spades
  SPADES_7: "SPADES_7",
  SPADES_8: "SPADES_8",
  SPADES_9: "SPADES_9",
  SPADES_10: "SPADES_10",
  SPADES_JACK: "SPADES_JACK",
  SPADES_QUEEN: "SPADES_QUEEN",
  SPADES_KING: "SPADES_KING",
  SPADES_ACE: "SPADES_ACE",
} as const;

export type CardTypeValue = (typeof CardType)[keyof typeof CardType];

// We only needs 7,8,9,10,J,Q,K,A
const CARDS = {
  // Clubs
  CLUBS_7: Clubs7Img,
  CLUBS_8: Clubs8Img,
  CLUBS_9: Clubs9Img,
  CLUBS_10: Clubs10Img,
  CLUBS_JACK: ClubsJackImg,
  CLUBS_QUEEN: ClubsQueenImg,
  CLUBS_KING: ClubsKingImg,
  CLUBS_ACE: ClubsAceImg,

  // Diamonds
  DIAMONDS_7: Diamonds7Img,
  DIAMONDS_8: Diamonds8Img,
  DIAMONDS_9: Diamonds9Img,
  DIAMONDS_10: Diamonds10Img,
  DIAMONDS_JACK: DiamondsJackImg,
  DIAMONDS_QUEEN: DiamondsQueenImg,
  DIAMONDS_KING: DiamondsKingImg,
  DIAMONDS_ACE: DiamondsAceImg,

  // Hearts
  HEARTS_7: Hearts7Img,
  HEARTS_8: Hearts8Img,
  HEARTS_9: Hearts9Img,
  HEARTS_10: Hearts10Img,
  HEARTS_JACK: HeartsJackImg,
  HEARTS_QUEEN: HeartsQueenImg,
  HEARTS_KING: HeartsKingImg,
  HEARTS_ACE: HeartsAceImg,

  // Spades
  SPADES_7: Spades7Img,
  SPADES_8: Spades8Img,
  SPADES_9: Spades9Img,
  SPADES_10: Spades10Img,
  SPADES_JACK: SpadesJackImg,
  SPADES_QUEEN: SpadesQueenImg,
  SPADES_KING: SpadesKingImg,
  SPADES_ACE: SpadesAceImg,
};

// Image wrapper component for cards
interface CardImageProps {
  cardType: CardTypeValue;
  className?: string;
  alt?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const CardImage: React.FC<CardImageProps> = ({
  cardType,
  className = "",
  alt = "Playing card",
  onClick,
  disabled = false,
}) => {
  const cardImage = CARDS[cardType];

  return (
    <img
      src={cardImage}
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

// Main PlayCard component
interface PlayCardProps {
  cardType: CardTypeValue;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  showBack?: boolean;
  size?: "sm" | "md" | "lg";
}

export const PlayCard: React.FC<PlayCardProps> = ({
  cardType,
  className = "",
  onClick,
  disabled = false,
  showBack = false,
  size = "md",
}) => {
  const [isFlipped, setIsFlipped] = useState(showBack);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      // On first render, set the initial state without animation
      setIsFlipped(showBack);
      setIsInitialized(true);
    } else if (isFlipped !== showBack) {
      // Only animate if the state actually changes after initialization
      setIsFlipped(showBack);
    }
  }, [showBack, isInitialized, isFlipped]);

  const cardVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  const sizes = {
    sm: "w-16 h-24",
    md: "w-20 h-28",
    lg: "w-24 h-32",
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`} style={{ perspective: "1000px" }}>
      <motion.div
        className="w-full h-full"
        animate={isFlipped ? "back" : "front"}
        variants={cardVariants}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden" }}
            >
              <CardImage
                cardType={cardType}
                className="w-full h-full"
                onClick={onClick}
                disabled={disabled}
              />
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <img
                src="/src/assets/cards/back.svg"
                alt="Card back"
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
