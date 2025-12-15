import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Crown, Skull, Brain, VenetianMask, Search } from 'lucide-react';
import Avatar from './Avatar';

export default function ProfileModal({ isOpen, onClose, user, stats }) {
    if (!isOpen) return null;

    const kudos = stats?.kudos || { detective: 0, liar: 0, mvp: 0 };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative w-full max-w-md bg-skin-card border border-skin-border rounded-2xl shadow-2xl p-6 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black uppercase text-skin-text tracking-wide flex items-center gap-2">
                            <Avatar seed={user?.avatarSeed} name={user?.name} size="xs" image={user?.avatarType === 'custom' ? user.avatarImage : null} accessory={user?.accessory} />
                            Perfil de Agente
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-skin-base flex items-center justify-center text-skin-muted hover:bg-skin-border transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Main Stats */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="flex-1 text-center bg-skin-base/50 p-3 rounded-xl border border-skin-border">
                            <div className="text-2xl font-black text-skin-primary">{stats?.totalGames || 0}</div>
                            <div className="text-xs font-bold text-skin-muted uppercase tracking-wider">Jogos</div>
                        </div>
                        <div className="flex-1 text-center bg-skin-base/50 p-3 rounded-xl border border-skin-border">
                            <div className="text-2xl font-black text-green-400">{stats?.wins?.citizen || 0}</div>
                            <div className="text-xs font-bold text-skin-muted uppercase tracking-wider">Vitórias (C)</div>
                        </div>
                        <div className="flex-1 text-center bg-skin-base/50 p-3 rounded-xl border border-skin-border">
                            <div className="text-2xl font-black text-red-400">{stats?.wins?.impostor || 0}</div>
                            <div className="text-xs font-bold text-skin-muted uppercase tracking-wider">Vitórias (I)</div>
                        </div>
                    </div>

                    {/* Kudos Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest pl-2 border-l-2 border-yellow-500">Reputação (Kudos)</h3>

                        <div className="grid grid-cols-3 gap-3">
                            <KudoCard
                                icon={<Search size={24} />}
                                count={kudos.detective || 0}
                                label="Detetive"
                                color="text-blue-400"
                                bg="bg-blue-400/10"
                                border="border-blue-400/20"
                            />
                            <KudoCard
                                icon={<VenetianMask size={24} />}
                                count={kudos.liar || 0}
                                label="Mentiroso"
                                color="text-red-400"
                                bg="bg-red-400/10"
                                border="border-red-400/20"
                            />
                            <KudoCard
                                icon={<Brain size={24} />}
                                count={kudos.mvp || 0}
                                label="Génio"
                                color="text-purple-400"
                                bg="bg-purple-400/10"
                                border="border-purple-400/20"
                            />
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function KudoCard({ icon, count, label, color, bg, border }) {
    return (
        <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${bg} ${border} transition-transform hover:scale-105`}>
            <div className={`mb-2 ${color}`}>{icon}</div>
            <div className={`text-2xl font-black ${color}`}>{count}</div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${color} opacity-80`}>{label}</div>
        </div>
    );
}
