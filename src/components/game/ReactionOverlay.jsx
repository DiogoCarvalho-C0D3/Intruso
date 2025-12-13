import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReactionOverlay() {
    const { socket, currentRoom } = useGame();
    const [reactions, setReactions] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleReaction = ({ emoji, socketId }) => {
            const id = Date.now() + Math.random();
            // Random x position (10% to 90%)
            const x = Math.random() * 80 + 10;

            setReactions(prev => [...prev, { id, emoji, x, socketId }]);

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
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {reactions.map(r => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 100, scale: 0.5, x: `${r.x}%` }}
                        animate={{ opacity: 1, y: -500, scale: 1.5, rotate: Math.random() * 20 - 10 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute bottom-20 text-4xl"
                    >
                        {r.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
