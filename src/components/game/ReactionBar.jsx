import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../../context/SoundContext';
import { SmilePlus, X } from 'lucide-react';

// Emoji set suitable for deduction game
const EMOJIS = ['😂', '🤨', '😡', '😱', '👏', '👻'];

export default function ReactionBar() {
    const { socket, currentRoom, currentUser } = useGame();
    const { playClick, playHover } = useSound();
    const [isOpen, setIsOpen] = useState(false);

    if (!currentRoom || !currentUser) return null;

    const sendReaction = (emoji) => {
        playClick(); // Local sound
        socket.emit('send_reaction', {
            roomId: currentRoom.id,
            emoji
        });

        // Add subtle haptic if available
        if (navigator.vibrate) navigator.vibrate(5);
        // setIsOpen(false); // Removed auto-close as per user request
    };

    return (
        <>
            {/* Backdrop to close on click outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 opacity-0 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="absolute bottom-32 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="flex flex-col gap-2 bg-skin-card/90 backdrop-blur border border-skin-border p-2 rounded-full shadow-xl mb-2"
                        >
                            {EMOJIS.map((emoji) => (
                                <motion.button
                                    key={emoji}
                                    whileTap={{ scale: 0.8 }}
                                    whileHover={{ scale: 1.2 }}
                                    onClick={() => sendReaction(emoji)}
                                    onMouseEnter={playHover}
                                    className="text-2xl w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { playClick(); setIsOpen(!isOpen); }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors border ${isOpen ? 'bg-skin-primary text-white border-skin-primary' : 'bg-skin-card text-skin-text border-skin-border'}`}
                >
                    {isOpen ? <X size={24} /> : <SmilePlus size={24} />}
                </motion.button>
            </div>
        </>
    );
}
