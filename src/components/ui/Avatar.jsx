import { useMemo } from 'react';
import { REWARDS_MAP } from '../../data/missions';

export default function Avatar({ name, seed: dataSeed, size = 'md', className = '', style = {}, accessory = null }) {

    // Define size in pixels for the container to ensure image fits
    const getPixelSize = () => {
        if (size === 'xl') return 120;
        if (size === 'lg') return 80;
        if (size === 'sm') return 32;
        if (size === 'xs') return 24;
        return 48; // md
    };

    // Use 'fun-emoji' for funny, 'adventurer' for characters. 
    // 'fun-emoji' is very performant and looks clearly distinct.
    const avatarUrl = useMemo(() => {
        const seed = dataSeed || name || 'guest';
        // API documentation: https://www.dicebear.com/styles/fun-emoji/
        return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    }, [name, dataSeed]);

    // Resolve accessory frame
    const frameClass = accessory && REWARDS_MAP[accessory]?.frameClass ? REWARDS_MAP[accessory].frameClass : '';

    return (
        <div
            className={`rounded-full flex items-center justify-center overflow-hidden bg-slate-700 ${className} ${frameClass}`}
            style={{
                width: style.width || getPixelSize() + 'px',
                height: style.height || getPixelSize() + 'px',
                minWidth: style.width || getPixelSize() + 'px', // Prevent squishing
                border: frameClass ? undefined : (style.border || '2px solid rgba(255,255,255,0.1)'), // Only apply default border if no frame
                ...style, // Allow overriding
            }}
        ><img
                src={avatarUrl}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }} // Fallback if API fails (could show initials here)
            />
        </div>
    );
}
