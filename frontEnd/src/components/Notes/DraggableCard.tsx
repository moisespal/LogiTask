// components/DraggableCard.tsx
import { motion } from "framer-motion";
import React, { ReactNode } from "react";

interface DraggableCardProps {
  children: ReactNode;
  className?: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ children, className }) => {
  return (
    <motion.div
      drag
      dragElastic={0.3}
      dragMomentum={false}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "inertia", stiffness: 0, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default DraggableCard;
