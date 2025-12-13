
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

export function useStatistics(userId = null) {
    // Dynamic key based on userId. If no userId, use temporary/global or handle gracefully.
    // However, for migration, we need to know if we are logged in.
    const storageKey = userId ? `intruso_stats_${userId}` : null;

    const [stats, setStats] = useState(() => {
        if (!storageKey) return INITIAL_STATS; // No user, no stats (or empty)

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                return { ...INITIAL_STATS, ...JSON.parse(saved) };
            }

            // Migration Only Logic:
            // If we have a userId but no stats for it yet, checks if we have LEGACY global stats
            // intended for this device's owner.
            const legacy = localStorage.getItem('intruso_stats');
            if (legacy) {
                // We found legacy stats. Let's claim them for this user!
                // Caveat: If multiple users login, the first one claims the legacy stats. 
                // This is acceptable for a personal device.
                const legacyStats = JSON.parse(legacy);
                return { ...INITIAL_STATS, ...legacyStats };
            }

            return INITIAL_STATS;
        } catch (e) {
            console.error('Stats load error', e);
            return INITIAL_STATS;
        }
    });

    const lastGameIdRef = useRef(null);

    import { socket } from '../context/GameContext'; // Import socket

    // ...

    export function useStatistics(userId = null) {
        // ... (existing state init) ...

        // Sync from Server
        useEffect(() => {
            const handleServerStats = (serverStats) => {
                if (serverStats) {
                    console.log('Received stats sync from server', serverStats);
                    setStats(prev => ({ ...prev, ...serverStats }));
                }
            };

            socket.on('stats_update', handleServerStats);
            return () => socket.off('stats_update', handleServerStats);
        }, []);

        // Save to local storage AND Server whenever stats change
        useEffect(() => {
            if (storageKey) {
                localStorage.setItem(storageKey, JSON.stringify(stats));

                // Sync to server
                if (userId && socket.connected) {
                    socket.emit('save_stats', { userId, stats });
                }
            }
        }, [stats, storageKey, userId]);

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
