import React, {useState, useEffect} from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DailyListItem from './DailyListItem';
import { Job } from '../../types/interfaces';
import '../../styles/components/SortableDailyList.css';
import { motion } from 'framer-motion';

interface SortableDailyListItemProps {
  job: Job;
  isFocused: boolean;
  onClick: (id: number) => void;
  onComplete?: (id: number) => void;
  isDisabled: boolean;
  isDragging?: boolean;
  onModalToggle?: (isOpen: boolean) => void;
}

const SortableDailyListItem: React.FC<SortableDailyListItemProps> = (props) => {
  const { job, isFocused, onClick, onComplete, isDisabled = false, onModalToggle } = props;
  const [mouseDirection, setMouseDirection] = useState(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: job.id,
    disabled: !isFocused || isDisabled // Disable dragging if not focused OR if explicitly disabled
  });

  useEffect(() => {
    if (isDragging) {
        const recentMovements = [0, 0, 0];
        
        const handleMouseMove = (e: MouseEvent) => {
            recentMovements.shift();
            recentMovements.push(e.movementX);
            
            const weightedSum = recentMovements[0] * 0.2 + 
                                recentMovements[1] * 0.3 + 
                                recentMovements[2] * 0.5;
            
            const sensitivity = 1.2;
            const maxRotation = 5;
            const rotation = Math.max(-maxRotation, Math.min(maxRotation, weightedSum * sensitivity));
            
            setMouseDirection(rotation);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }
}, [isDragging]);

  return (
    <div 
      ref={setNodeRef} 
      style={{
        transform: CSS.Transform.toString(transform), 
        transition,
        cursor: isDisabled ? 'default' : undefined
      }} 
      {...attributes}
      {...listeners}  
    >
      <motion.div 
        className={`sortable-job-wrapper ${isDisabled ? 'disabled' : ''} ${isFocused ? 'draggable' : ''}`}
        animate={isDragging ? { rotate: mouseDirection, scale:0.97 } : { rotate: 0, scale: 1 }}
        style={{
          boxShadow: isDragging 
            ? "20px 10px 25px rgba(0,0,0,0.3), 0px 4px 10px rgba(0,0,0,0.2)" 
            : (isFocused ? "0px 2px 5px rgba(0,0,0,0.1)" : "none")
        }}
        transition={{
          rotate: {
            type: "spring",
            stiffness: 300,    
            damping: 25,       
            mass: 0.6,         
            velocity: 0        
          },
          scale: {
            type: "spring",
            stiffness: 350,
            damping: 20
          },
          default: {
            duration: 0.3
          }
        }}
      >
        <DailyListItem
          job={job}
          isFocused={isFocused}
          onClick={onClick}
          onComplete={onComplete}
          onModalToggle={onModalToggle}
        />
      </motion.div>
    </div>
  );
};

export default SortableDailyListItem;