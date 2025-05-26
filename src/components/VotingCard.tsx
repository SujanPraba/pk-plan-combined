import { useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { FibonacciValue, TShirtValue } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <motion.div
      initial={{ scale: 1 }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "relative cursor-pointer select-none",
        disabled && !selected && "opacity-50 cursor-not-allowed"
      )}
      onClick={handleVote}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "w-full aspect-[2/3] rounded-xl p-4 flex items-center justify-center",
          "border-2 shadow-lg transition-colors duration-200",
          selected
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-card border-border hover:border-primary/50",
          disabled && !selected && "hover:border-border"
        )}
      >
        <div className="relative w-full h-full">
          {/* Card Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-2 border-2 border-current rounded-lg" />
            <div className="absolute inset-x-0 top-0 h-8 flex items-center justify-center">
              <div className="w-12 h-1 bg-current rounded-full" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-8 flex items-center justify-center rotate-180">
              <div className="w-12 h-1 bg-current rounded-full" />
            </div>
          </div>

          {/* Card Value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">{value}</span>
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-4 h-4 text-primary-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VotingCard;
