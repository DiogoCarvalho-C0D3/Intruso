import { motion } from 'framer-motion';

export default function Card({ children, className = '', animate = true, ...rest }) {
    const Component = animate ? motion.div : 'div';
    const props = animate ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 }
    } : {};

    return (
        <Component
            className={`card ${className}`}
            {...props}
            {...rest}
        >
            {children}
        </Component>
    );
}
