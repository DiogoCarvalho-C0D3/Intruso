import { useGame } from '../../context/GameContext';

const DECORATIONS = [
    { emoji: '🎅', top: '5%', left: '5%', rotate: '-10deg', size: '2rem' },
    { emoji: '🎄', bottom: '15%', right: '5%', rotate: '5deg', size: '3rem' },
    { emoji: '🎁', bottom: '5%', left: '10%', rotate: '15deg', size: '2rem' },
    { emoji: '🦌', top: '15%', right: '10%', rotate: '-5deg', size: '2.5rem' },
    { emoji: '⛄', top: '50%', left: '-2%', rotate: '10deg', size: '2rem', opacity: 0.5 },
    { emoji: '🍬', bottom: '40%', right: '-2%', rotate: '-20deg', size: '1.5rem', opacity: 0.6 },
    { emoji: '🌿', top: '0', left: '50%', rotate: '0deg', size: '3rem', transform: 'translateX(-50%)' }, // Mistletoe/Holly center
];

export default function ChristmasDecorations() {
    const { currentUser } = useGame();

    if (currentUser?.theme !== 'theme-christmas') return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {DECORATIONS.map((item, index) => (
                <div
                    key={index}
                    className="absolute select-none animate-pulse"
                    style={{
                        top: item.top,
                        left: item.left,
                        right: item.right,
                        bottom: item.bottom,
                        transform: item.transform || `rotate(${item.rotate})`,
                        fontSize: item.size,
                        opacity: item.opacity || 0.8,
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                    }}
                >
                    {item.emoji}
                </div>
            ))}
        </div>
    );
}
