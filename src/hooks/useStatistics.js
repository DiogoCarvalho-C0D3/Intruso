
import { useState, useEffect, useRef } from 'react';

import { MISSIONS } from '../data/missions';

const STORAGE_KEY = 'intruso_stats';

const INITIAL_STATS = {
    totalGames: 0,
    wins: { impostor: 0, citizen: 0 },
    roles: { impostor: 0, citizen: 0 },
    categories: {},
    history: [], // { date, role, result, category, gameId }
    unlockedRewards: [], // IDs of unlocked rewards
    equippedReward: null // ID of equipped helper
};

export function useStatistics() {
    const [stats, setStats] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...INITIAL_STATS, ...JSON.parse(saved) } : INITIAL_STATS;
        } catch (e) {
            console.error('Stats load error', e);
            return INITIAL_STATS;
        }
    });

    const lastGameIdRef = useRef(null);

    // Save to local storage whenever stats change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }, [stats]);

    const checkMissions = (currentStats) => {
        const completedMissions = [];
        const currentUnlocked = new Set(currentStats.unlockedRewards || []);

        MISSIONS.forEach(mission => {
            if (currentUnlocked.has(mission.reward.id)) return; // Already unlocked

            let value = 0;
            if (mission.statKey === 'totalWins') {
                value = (currentStats.wins.impostor || 0) + (currentStats.wins.citizen || 0);
            } else if (mission.statKey.includes('.')) {
                const [parent, child] = mission.statKey.split('.');
                value = currentStats[parent]?.[child] || 0;
            } else {
                value = currentStats[mission.statKey] || 0;
            }

            if (value >= mission.target) {
                completedMissions.push(mission.reward.id);
            }
        });

        return completedMissions;
    };

    const recordGame = (gameResult) => {
        // gameResult: { gameId, role: 'impostor'|'citizen', won: boolean, category: string }

        // Prevent double recording in current session (memory)
        if (lastGameIdRef.current === gameResult.gameId) return;

        // Prevent double recording in storage (persistence)
        if (stats.history.some(h => h.gameId === gameResult.gameId)) return;

        lastGameIdRef.current = gameResult.gameId;

        setStats(prev => {
            const newStats = { ...prev };

            // Basics
            newStats.totalGames = (newStats.totalGames || 0) + 1;

            // Roles
            if (gameResult.role === 'impostor') newStats.roles.impostor++;
            else newStats.roles.citizen++;

            // Wins
            if (gameResult.won) {
                if (gameResult.role === 'impostor') newStats.wins.impostor++;
                else newStats.wins.citizen++;
            }

            // Categories
            const cat = gameResult.category || 'Geral';
            newStats.categories[cat] = (newStats.categories[cat] || 0) + 1;

            // History (Max 20 items)
            const entry = {
                gameId: gameResult.gameId,
                date: Date.now(),
                role: gameResult.role,
                won: gameResult.won,
                category: cat
            };

            newStats.history = [entry, ...prev.history].slice(0, 20);

            // Check Missions
            const newUnlocks = checkMissions(newStats);
            if (newUnlocks.length > 0) {
                newStats.unlockedRewards = [...(newStats.unlockedRewards || []), ...newUnlocks];
                // Notify user? Usually handled by UI checking stats
            }

            return newStats;
        });
    };

    const equipReward = (rewardId) => {
        setStats(prev => ({ ...prev, equippedReward: rewardId }));
    };

    const resetStats = () => {
        setStats(INITIAL_STATS);
    };

    return { stats, recordGame, resetStats, equipReward };
}
