
import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';

export default function Snowfall() {
    const { currentUser } = useGame();
    const [snowflakes, setSnowflakes] = useState([]);

    useEffect(() => {
        if (currentUser?.theme !== 'theme-christmas') {
            setSnowflakes([]);
            return;
        }

        // Generate static snowflakes once to avoid constant re-renders
        const flakes = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            animationDuration: Math.random() * 3 + 2 + 's',
            animationDelay: Math.random() * 5 + 's',
            opacity: Math.random() * 0.5 + 0.3,
            size: Math.random() * 10 + 5 + 'px'
        }));
        setSnowflakes(flakes);
    }, [currentUser?.theme]);

    if (currentUser?.theme !== 'theme-christmas') return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            {snowflakes.map(flake => (
                <div
                    key={flake.id}
                    className="absolute top-[-20px] bg-white rounded-full animate-snowfall"
                    style={{
                        left: flake.left,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        animationDuration: flake.animationDuration,
                        animationDelay: flake.animationDelay
                    }}
                />
            ))}
        </div>
    );
}
