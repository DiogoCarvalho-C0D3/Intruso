import { useGame } from '../../context/GameContext';

const DECORATIONS = [
    { emoji: '✨', top: '10%', left: '8%', rotate: '0deg', size: '1.5rem', opacity: 0.6 },
    { emoji: '🎄', bottom: '12%', right: '8%', rotate: '5deg', size: '2.5rem', opacity: 0.8 },
    { emoji: '❄️', bottom: '8%', left: '12%', rotate: '15deg', size: '2rem', opacity: 0.5 },
    { emoji: '⭐', top: '15%', right: '12%', rotate: '-5deg', size: '1.8rem', opacity: 0.7 },
    { emoji: '🌨️', top: '45%', left: '2%', rotate: '0deg', size: '2rem', opacity: 0.4 },
    { emoji: '🔔', bottom: '35%', right: '2%', rotate: '-15deg', size: '1.5rem', opacity: 0.6 },
    { emoji: '🎀', top: '5%', left: '50%', rotate: '0deg', size: '2rem', transform: 'translateX(-50%)' },
];

export default function ChristmasDecorations() {
    const { currentUser } = useGame();

    if (currentUser?.theme !== 'theme-christmas') return null;
    return null; // Force disable per user request for cleaner UI

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
