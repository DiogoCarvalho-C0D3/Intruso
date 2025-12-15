import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../../context/SoundContext';
import { SmilePlus, X } from 'lucide-react';

// Emoji set suitable for deduction game
const EMOJIS = ['😂', '🤨', '😡', '😱', '👏', '👻'];

// Quick Chat Phrases
const CHAT_PHRASES = [
    "Suspeito! 🧐",
    "Confia em mim! 🤝",
    "Não sou eu! 😇",
    "É ele(a)! 👉",
    "Silêncio... 🤫",
    "Votem! 🗳️"
];

export default function ReactionBar() {
    const { socket, currentRoom, currentUser } = useGame();
    const { playClick, playHover } = useSound();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('emoji'); // 'emoji' or 'text'

    if (!currentRoom || !currentUser) return null;

    const sendReaction = (content, type = 'emoji') => {
        playClick(); // Local sound
        socket.emit('send_reaction', {
            roomId: currentRoom.id,
            emoji: content, // keeping key 'emoji' for back-compat or server generic handler, but could be 'content'
            type // 'emoji' or 'text'
        });

        // Add subtle haptic if available
        if (navigator.vibrate) navigator.vibrate(5);
        setIsOpen(false);
    };

    const toggleMode = (e) => {
        e.stopPropagation();
        setMode(prev => prev === 'emoji' ? 'text' : 'emoji');
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
                            className="flex flex-col gap-2 bg-skin-card/90 backdrop-blur border border-skin-border p-2 rounded-2xl shadow-xl mb-2 min-w-[60px] items-center"
                        >
                            {/* Mode Toggle */}
                            <div className="flex gap-1 bg-skin-base/50 p-1 rounded-full mb-1 w-full">
                                <button
                                    onClick={() => setMode('emoji')}
                                    className={`flex-1 py-1 rounded-full text-xs font-bold transition-colors ${mode === 'emoji' ? 'bg-skin-primary text-white shadow' : 'text-skin-muted hover:text-skin-text'}`}
                                >
                                    😀
                                </button>
                                <button
                                    onClick={() => setMode('text')}
                                    className={`flex-1 py-1 rounded-full text-xs font-bold transition-colors ${mode === 'text' ? 'bg-skin-primary text-white shadow' : 'text-skin-muted hover:text-skin-text'}`}
                                >
                                    💬
                                </button>
                            </div>

                            {mode === 'emoji' ? (
                                <div className="grid grid-cols-1 gap-1">
                                    {EMOJIS.map((emoji) => (
                                        <motion.button
                                            key={emoji}
                                            whileTap={{ scale: 0.8 }}
                                            whileHover={{ scale: 1.2 }}
                                            onClick={() => sendReaction(emoji, 'emoji')}
                                            onMouseEnter={playHover}
                                            className="text-2xl w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            {emoji}
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1 w-32">
                                    {CHAT_PHRASES.map((phrase, i) => (
                                        <motion.button
                                            key={i}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => sendReaction(phrase, 'text')}
                                            className="text-xs font-bold text-left px-3 py-2 bg-skin-base/50 hover:bg-skin-primary/20 hover:text-skin-primary rounded-lg transition-colors truncate"
                                        >
                                            {phrase}
                                        </motion.button>
                                    ))}
                                </div>
                            )}
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
