
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, CheckCircle, Lock } from 'lucide-react';
import Button from './Button';
import { MISSIONS } from '../../data/missions';

export default function MissionsModal({ isOpen, onClose, stats, onEquip }) {
    if (!isOpen) return null;

    const unlockedSet = new Set(stats.unlockedRewards || []);

    // Sort missions: Unlocked first, then by progress? Or default order?
    // Let's keep default order but visual difference.

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-skin-card border border-skin-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-skin-border bg-skin-base/50">
                        <div className="flex items-center gap-2">
                            <Gift className="text-pink-400" size={20} />
                            <h2 className="font-bold text-lg text-skin-text">Missões e Prémios</h2>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-skin-base rounded-full transition-colors">
                            <X size={20} className="text-skin-muted" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">

                        {/* Rewards Collection */}
                        <div>
                            <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest mb-3">A tua coleção</h3>
                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                {/* Default Clean Option */}
                                <button
                                    onClick={() => onEquip(null)}
                                    className={`flex-none w-16 h-16 rounded-xl flex items-center justify-center text-xs font-bold text-skin-muted border-2 transition-all active:scale-95 ${!stats.equippedReward
                                        ? 'bg-skin-primary/20 border-skin-primary text-skin-primary'
                                        : 'bg-skin-base border-skin-border hover:border-skin-primary/50'
                                        }`}
                                >
                                    Nada
                                </button>

                                {MISSIONS.filter(m => unlockedSet.has(m.reward.id)).map(mission => {
                                    const isEquipped = stats.equippedReward === mission.reward.id;

                                    return (
                                        <button
                                            key={mission.id}
                                            onClick={() => onEquip(mission.reward.id)}
                                            className={`flex-none w-16 h-16 rounded-xl flex items-center justify-center text-3xl relative border-2 transition-all active:scale-95 ${isEquipped
                                                ? 'bg-skin-primary/20 border-skin-primary shadow-lg shadow-skin-primary/20'
                                                : 'bg-skin-base border-skin-border hover:border-skin-primary/50 cursor-pointer'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full bg-slate-700 ${mission.reward.frameClass}`}></div>

                                            {isEquipped && (
                                                <div className="absolute -top-2 -right-2 bg-skin-primary text-white p-0.5 rounded-full border-2 border-skin-card z-10">
                                                    <CheckCircle size={10} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}

                                {unlockedSet.size === 0 && (
                                    <div className="flex items-center text-xs text-skin-muted italic px-2 whitespace-nowrap">
                                        Completa missões para desbloquear!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Missions List */}
                        <div>
                            <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest mb-3">Missões</h3>
                            <div className="space-y-3">
                                {MISSIONS.map(mission => {
                                    const isUnlocked = unlockedSet.has(mission.reward.id);
                                    let currentVal = 0;

                                    // Calculate current value again for display
                                    // (Duplicated logic from checkMissions, simpler to pass or compute here)
                                    if (mission.statKey === 'totalWins') {
                                        currentVal = (stats.wins.impostor || 0) + (stats.wins.citizen || 0);
                                    } else if (mission.statKey.includes('.')) {
                                        const [parent, child] = mission.statKey.split('.');
                                        currentVal = stats[parent]?.[child] || 0;
                                    } else {
                                        currentVal = stats[mission.statKey] || 0;
                                    }

                                    // Cap at target
                                    const displayVal = Math.min(currentVal, mission.target);
                                    const percent = Math.min(100, Math.round((currentVal / mission.target) * 100));

                                    return (
                                        <div key={mission.id} className={`p-3 rounded-xl border ${isUnlocked ? 'bg-green-500/5 border-green-500/20' : 'bg-skin-base border-skin-border'}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className={`font-bold text-sm ${isUnlocked ? 'text-green-500' : 'text-skin-text'}`}>{mission.title}</h4>
                                                    <p className="text-xs text-skin-muted">{mission.description}</p>
                                                </div>
                                                <div className={`w-8 h-8 rounded-full bg-slate-700 ${mission.reward.frameClass}`}></div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2 w-full bg-skin-card rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${isUnlocked ? 'bg-green-500' : 'bg-skin-primary'}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] uppercase font-bold text-skin-muted">{isUnlocked ? 'Completada!' : 'Em progresso'}</span>
                                                <span className="text-[10px] font-bold text-skin-text">{displayVal} / {mission.target}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
