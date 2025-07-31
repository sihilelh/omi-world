import type { PlayerCard } from "../../stores/roundStore";
import { getCardNameByNumber } from "../../utils/playCard";
import { PlayCard } from "../atoms/PlayCard";
import { SuitOutline, type SuitTypeValue } from "../atoms/SuitOutline";

const suitSet = ["SPADES", "HEARTS", "CLUBS", "DIAMONDS"];

export const TrickSuitSelect = ({
  myCardSet,
  onSuitClick,
}: {
  myCardSet: PlayerCard[];
  onSuitClick: (suit: string) => void;
}) => {
  return (
    <div className="text-center">
      <div>
        <div className="text-white text-3xl font-bold mb-8">
          Here's your first 4 cards
        </div>
        <div className="flex items-center justify-center gap-4 mb-8">
          {myCardSet.map((card) => (
            <PlayCard cardType={getCardNameByNumber(card.number)} size="lg" />
          ))}
        </div>
      </div>
      <div className="text-white text-2xl font-bold mb-8">
        Select the Trick Suit
      </div>
      <div className="flex items-center justify-center">
        <div className="grid grid-cols-4 gap-4 bg-neutral-800 px-4 py-4 rounded-full">
          {suitSet.map((suit) => (
            <SuitOutline
              suitType={suit as SuitTypeValue}
              onClick={() => onSuitClick(suit)}
              className="cursor-pointer scale-100 hover:scale-110 transition-all duration-300"
              fill={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
