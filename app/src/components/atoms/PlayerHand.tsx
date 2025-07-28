import { PlayCard } from "./PlayCard";
import type { CardTypeValue } from "./PlayCard";

interface Card {
  cardType: CardTypeValue;
  disabled?: boolean;
}

interface PlayerHandProps {
  cards: Card[];
  onCardClick?: (cardType: CardTypeValue) => void;
  selectOnly?: "CLUBS" | "DIAMONDS" | "HEARTS" | "SPADES";
  className?: string;
}

export const PlayerHand = ({ 
  cards, 
  onCardClick, 
  selectOnly, 
  className = "" 
}: PlayerHandProps) => {
  const isCardDisabled = (cardType: CardTypeValue) => {
    if (!selectOnly) return false;
    
    const cardSuit = cardType.split('_')[0];
    return cardSuit !== selectOnly;
  };

  const handleCardClick = (cardType: CardTypeValue) => {
    if (onCardClick && !isCardDisabled(cardType)) {
      onCardClick(cardType);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {cards.map((card, index) => (
        <PlayCard
          key={`${card.cardType}-${index}`}
          cardType={card.cardType}
          size="lg"
          disabled={card.disabled || isCardDisabled(card.cardType)}
          onClick={() => handleCardClick(card.cardType)}
        />
      ))}
    </div>
  );
}; 