
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FibonacciValue, TShirtValue } from "@/types";
import { usePoker } from "@/contexts/PokerContext";

interface VotingCardProps {
  value: FibonacciValue | TShirtValue;
  selected?: boolean;
  disabled?: boolean;
}

const VotingCard = ({ value, selected, disabled }: VotingCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { submitVote } = usePoker();

  const handleVote = () => {
    if (disabled) return;
    submitVote(value);
  };

  return (
    <Button
      variant={selected ? "default" : "outline"}
      className={`h-16 relative transform transition-all ${
        isHovered && !disabled ? "scale-105" : ""
      } ${selected ? "bg-primary text-primary-foreground" : ""}
      ${disabled && !selected ? "opacity-50" : ""}`}
      onClick={handleVote}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-lg font-semibold">{value}</span>
    </Button>
  );
};

export default VotingCard;
