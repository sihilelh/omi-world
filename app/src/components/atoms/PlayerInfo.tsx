import { CardPack } from "./CardPack";

interface PlayerInfoProps {
  name: string;
  cardCount: number;
  teamColor: "red" | "black";
  position: "top" | "left" | "right";
  className?: string;
}

export const PlayerInfo = ({ 
  name, 
  cardCount, 
  teamColor, 
  position, 
  className = "" 
}: PlayerInfoProps) => {
  const getCardPackRotation = () => {
    switch (position) {
      case "top":
        return "rotate-180";
      case "left":
        return "rotate-90";
      case "right":
        return "-rotate-90";
      default:
        return "";
    }
  };

  const getCardPackOrder = () => {
    return position === "right" ? "order-2" : "order-1";
  };

  const getPlayerInfoOrder = () => {
    return position === "right" ? "order-1" : "order-2";
  };

  const bgColor = teamColor === "red" ? "bg-red-600" : "bg-black";

  return (
    <div className={`flex items-center gap-8 ${className}`}>
      <CardPack 
        count={cardCount} 
        className={`${getCardPackRotation()} ${getCardPackOrder()}`} 
        size="lg" 
      />
      <div className={`bg-neutral-800 rounded-full pl-1 pr-2 gap-2 flex items-center ${getPlayerInfoOrder()}`}>
        <div className={`w-4 h-4 ${bgColor} rounded-full border border-white`}></div>
        {name}
      </div>
    </div>
  );
}; 