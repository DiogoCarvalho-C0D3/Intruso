import { useGame } from '../../context/GameContext';
import { motion } from 'framer-motion';
import { useSound } from '../../context/SoundContext';

// Emoji set suitable for deduction game
const EMOJIS = ['😂', '🤨', '😡', '😱', '👏', '👻'];

export default function ReactionBar() {
    const { socket, currentRoom, currentUser } = useGame();
    const { playClick, playHover } = useSound();

    if (!currentRoom || !currentUser) return null;

    const sendReaction = (emoji) => {
        playClick(); // Local sound
        socket.emit('send_reaction', {
            roomId: currentRoom.id,
            emoji
        });

        // Add subtle haptic if available
        if (navigator.vibrate) navigator.vibrate(5);
    };

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-skin-card/90 backdrop-blur border border-skin-border p-2 rounded-full shadow-xl">
            {EMOJIS.map((emoji) => (
                <motion.button
                    key={emoji}
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ scale: 1.2, y: -2 }}
                    onClick={() => sendReaction(emoji)}
                    onMouseEnter={playHover}
                    className="text-2xl w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                >
                    {emoji}
                </motion.button>
            ))}
        </div>
    );
}
