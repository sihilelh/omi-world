import LogoImg from "../../assets/logo.svg";

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo = ({ className = "w-10 h-10", alt = "Logo" }: LogoProps) => {
  return <img src={LogoImg} alt={alt} className={className} />;
}; 