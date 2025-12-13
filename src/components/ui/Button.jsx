import { motion } from 'framer-motion';
import { useSound } from '../../context/SoundContext';

export default function Button({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }) {
    const baseClass = variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary';
    const { playClick, playHover } = useSound();

    const handleClick = (e) => {
        if (!disabled) playClick();
        if (onClick) onClick(e);
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onMouseEnter={() => !disabled && playHover()}
            className={`${baseClass} ${className}`}
            onClick={handleClick}
            disabled={disabled}
            style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
            {...props}
        >
            {children}
        </motion.button>
    );
}
