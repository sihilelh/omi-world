import type { CardTypeValue } from "../components/atoms/PlayCard";

const suitSet = ["SPADES", "HEARTS", "CLUBS", "DIAMONDS"];

const cardSet = ["7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"];

export const getCardNameByNumber = (number: number): CardTypeValue => {
  const suit = suitSet[Math.floor(number / 8)];
  const card = cardSet[number % 8];
  return `${suit}_${card}` as CardTypeValue;
};

export const getCardNumberByName = (cardName: CardTypeValue): number => {
  const suit = cardName.split("_")[0];
  const card = cardName.split("_")[1];
  return suitSet.indexOf(suit) * 8 + cardSet.indexOf(card);
};
