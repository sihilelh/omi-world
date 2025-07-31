import type { CardTypeValue } from "../components/atoms/PlayCard";

const suitSet = ["SPADES", "HEARTS", "CLUBS", "DIAMONDS"];

const cardSet = ["7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"];

export const getCardNameByNumber = (number: number): CardTypeValue => {
  const suit = suitSet[Math.floor(number / 8)];
  const card = cardSet[number % 8];
  return `${suit}_${card}` as CardTypeValue;
};
