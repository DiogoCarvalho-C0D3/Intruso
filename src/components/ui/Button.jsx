import { motion } from 'framer-motion';

export default function Button({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }) {
    const baseClass = variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary';

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className={`${baseClass} ${className}`}
            onClick={onClick}
            disabled={disabled}
            style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
            {...props}
        >
            {children}
        </motion.button>
    );
}
