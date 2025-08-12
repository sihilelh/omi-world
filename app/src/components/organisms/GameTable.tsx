import { CardTable } from "../molecules/CardTable";
import { PlayerInfo } from "../atoms/PlayerInfo";
import { PlayCard } from "../atoms/PlayCard";
import { PlayerTurnIndicator } from "../atoms/PlayerTurnIndicator";
import { SuitOutline, type SuitTypeValue } from "../atoms/SuitOutline";
import { getCardNameByNumber } from "../../utils/playCard";

interface Player {
  userId: string;
  slot: number;
  team: string;
}

interface MoveCard {
  slot: number;
  card: number;
}

interface GameTableProps {
  players: Player[];
  mySlot: number;
  currentSlot: number;
  currentMoveCards: MoveCard[];
  trickSuit: string;
  onCardClick?: (cardType: string) => void;
}

export const GameTable = ({
  players,
  mySlot,
  currentSlot,
  currentMoveCards,
  trickSuit,
  onCardClick,
}: GameTableProps) => {
  const topPlayer = players.find((player) => player.slot === (mySlot + 2) % 4);
  const leftPlayer = players.find((player) => player.slot === (mySlot + 3) % 4);
  const rightPlayer = players.find((player) => player.slot === (mySlot + 1) % 4);

  return (
    <>
      {/* Other Players  */}
      {/* Top Player  */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <PlayerInfo
          name={topPlayer?.userId || "Unknown"}
          cardCount={8}
          teamColor={topPlayer?.team === "TEAM_RED" ? "red" : "black"}
          position="top"
        />
      </div>

      {/* Left Player  */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2">
        <PlayerInfo
          name={leftPlayer?.userId || "Unknown"}
          cardCount={8}
          teamColor={leftPlayer?.team === "TEAM_RED" ? "red" : "black"}
          position="left"
        />
      </div>

      {/* Right Player  */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2">
        <PlayerInfo
          name={rightPlayer?.userId || "Unknown"}
          cardCount={8}
          teamColor={rightPlayer?.team === "TEAM_RED" ? "red" : "black"}
          position="right"
        />
      </div>

      <CardTable>
        <div className="w-full h-full relative">
          {/* Top Players Table Card  */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            {currentMoveCards
              .filter((card) => card.slot === topPlayer?.slot)
              .map((card) => (
                <PlayCard
                  key={`${card.slot}-${card.card}`}
                  cardType={getCardNameByNumber(card.card)}
                  size="sm"
                />
              ))}
            {topPlayer?.slot === currentSlot && <PlayerTurnIndicator />}
          </div>

          {/* Right Players Table Card  */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            {currentMoveCards
              .filter((card) => card.slot === rightPlayer?.slot)
              .map((card) => (
                <PlayCard
                  key={`${card.slot}-${card.card}`}
                  cardType={getCardNameByNumber(card.card)}
                  size="sm"
                />
              ))}
            {rightPlayer?.slot === currentSlot && <PlayerTurnIndicator />}
          </div>

          {/* Left Players Table Card  */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
            {currentMoveCards
              .filter((card) => card.slot === leftPlayer?.slot)
              .map((card) => (
                <PlayCard
                  key={`${card.slot}-${card.card}`}
                  cardType={getCardNameByNumber(card.card)}
                  size="sm"
                />
              ))}
            {leftPlayer?.slot === currentSlot && <PlayerTurnIndicator />}
          </div>

          {/* Bottom Players Table Card  */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            {currentMoveCards
              .filter((card) => card.slot === mySlot)
              .map((card) => (
                <PlayCard
                  key={`${card.slot}-${card.card}`}
                  cardType={getCardNameByNumber(card.card)}
                  size="sm"
                />
              ))}
            {mySlot === currentSlot && <PlayerTurnIndicator />}
          </div>

          {/* This Round's Selected Suit  */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <SuitOutline suitType={trickSuit as SuitTypeValue} />
          </div>
        </div>
      </CardTable>
    </>
  );
}; 