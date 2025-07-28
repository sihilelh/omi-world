import TableImg from "../../assets/other/table.svg";

interface CardTableProps {
  children?: React.ReactNode;
}

export const CardTable = ({ children }: CardTableProps) => {
  return (
    <div className="relative h-[50vh] w-auto">
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        {children}
      </div>
      <img src={TableImg} className="h-full w-auto" alt="Card Table" />
    </div>
  );
}; 