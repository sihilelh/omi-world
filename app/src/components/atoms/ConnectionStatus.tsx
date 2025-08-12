import { RotateCcw } from "lucide-react";

interface ConnectionStatusProps {
  status: "CONNECTED" | "DISCONNECTED" | "CONNECTING";
  onReconnect?: () => void;
}

export const ConnectionStatus = ({
  status,
  onReconnect,
}: ConnectionStatusProps) => {
  if (status === "DISCONNECTED") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full border border-white"></div>
        <p className="text-xs text-red-100">Disconnected</p>
        {onReconnect && (
          <button
            title="Try Again!"
            onClick={onReconnect}
            className="text-red-100 cursor-pointer"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>
    );
  }

  if (status === "CONNECTED") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
        <p className="text-xs text-green-100">Connected</p>
      </div>
    );
  }

  if (status === "CONNECTING") {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-2 h-2 bg-neutral-500 rounded-full border border-white"></div>
        <p className="text-xs text-neutral-100">Connecting to server ...</p>
      </div>
    );
  }

  return null;
};
