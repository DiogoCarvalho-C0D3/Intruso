import { useMemo } from 'react';
import { REWARDS_MAP } from '../../data/missions';

export default function Avatar({ name, seed, image, size = 'md', className = '', accessory = null, onClick }) {

    // Define size classes for TailwindCSS
    const sizeClasses = {
        xl: 'w-[120px] h-[120px] min-w-[120px]',
        lg: 'w-[80px] h-[80px] min-w-[80px]',
        md: 'w-[48px] h-[48px] min-w-[48px]',
        sm: 'w-[32px] h-[32px] min-w-[32px]',
        xs: 'w-[24px] h-[24px] min-w-[24px]',
    };

    // DiceBear URL
    const avatarUrl = useMemo(() => {
        if (image) return image; // Use custom image if available
        const seedValue = seed || name || 'default';
        // API documentation: https://www.dicebear.com/styles/fun-emoji/
        return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seedValue)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    }, [seed, name, image]);

    const isCustom = !!image;

    // Resolve accessory frame
    const frameClass = accessory && REWARDS_MAP[accessory]?.frameClass ? REWARDS_MAP[accessory].frameClass : '';

    return (
        <div
            onClick={onClick}
            className={`relative rounded-full overflow-hidden bg-white/20 backdrop-blur-sm ${sizeClasses[size] || sizeClasses.md} ${className} ${frameClass} ${onClick ? 'cursor-pointer' : ''}`}
        >
            <img
                src={avatarUrl}
                alt={name || 'Avatar'}
                className={`w-full h-full object-cover`}
                onError={(e) => { e.target.style.display = 'none'; }}
            />

            {/* Accessory logic (if overlay needed) could go here, but strictly we are using frameClass on container */}
        </div>
    );
}
