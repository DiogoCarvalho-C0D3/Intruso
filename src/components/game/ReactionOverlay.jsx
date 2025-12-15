import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReactionOverlay() {
    const { socket, currentRoom } = useGame();
    const [reactions, setReactions] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleReaction = ({ emoji, type, socketId }) => {
            const id = Date.now() + Math.random();
            // Random x position
            // Text bubbles are wider, so we keep them more central (20% to 60%) to prevent overflow
            // Emojis can roam freer (10% to 90%)
            const minX = type === 'text' ? 20 : 10;
            const maxX = type === 'text' ? 60 : 90;
            const x = Math.random() * (maxX - minX) + minX;

            setReactions(prev => [...prev, { id, emoji, type, x, socketId }]);

            // Cleanup
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== id));
            }, 2500);
        };

        socket.on('reaction_received', handleReaction);
        return () => {
            socket.off('reaction_received', handleReaction);
        };
    }, [socket]);

    if (!currentRoom) return null; // Only show in rooms

    return (
        <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {reactions.map(r => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 100, scale: 0.5, x: `${r.x}vw` }}
                        animate={{
                            opacity: [0, 1, 1, 0], // Fade in, stay, fade out
                            y: -600, // Move way up
                            scale: [0.8, 1, 1],
                            rotate: r.type === 'text' ? 0 : Math.random() * 40 - 20
                        }}
                        transition={{ duration: 4, ease: "easeOut" }} // Slower duration for "bubble up" feel
                        className={`absolute bottom-0 pointer-events-none drop-shadow-lg ${r.type === 'text'
                            ? 'bg-skin-card/90 backdrop-blur border border-skin-border px-4 py-2 rounded-2xl rounded-bl-sm text-sm font-bold text-skin-text shadow-xl max-w-[200px]'
                            : 'text-5xl'
                            }`}
                        style={{ left: 0 }} // x is handled by transform x in vw
                    >
                        {r.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
