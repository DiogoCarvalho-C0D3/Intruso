
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, User, Target, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function StatsModal({ isOpen, onClose, stats, onReset }) {
    if (!isOpen) return null;

    const winRate = stats.totalGames > 0
        ? Math.round(((stats.wins.impostor + stats.wins.citizen) / stats.totalGames) * 100)
        : 0;

    // Sort categories by most played
    const topCategories = Object.entries(stats.categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

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
                    className="relative w-full max-w-sm bg-skin-card border border-skin-border rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-skin-border bg-skin-base/50">
                        <div className="flex items-center gap-2">
                            <Trophy className="text-yellow-400" size={20} />
                            <h2 className="font-bold text-lg text-skin-text">O Teu Currículo</h2>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-skin-base rounded-full transition-colors">
                            <X size={20} className="text-skin-muted" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-skin-base p-3 rounded-xl border border-skin-border text-center flex flex-col items-center justify-center">
                                <span className="block text-3xl font-black text-skin-text">{stats.totalGames}</span>
                                <span className="text-xs text-skin-muted font-bold uppercase">Jogos</span>
                            </div>
                            <div className="bg-skin-base p-3 rounded-xl border border-skin-border text-center flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                                    {/* Pie Chart / Donut */}
                                    <div
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            background: `conic-gradient(var(--color-primary) ${winRate}%, transparent 0)`
                                        }}
                                    />
                                    {/* Inner Circle for Donut effect */}
                                    <div className="absolute inset-2 bg-skin-base rounded-full z-10" />
                                    {/* Text */}
                                    <span className="relative z-20 text-sm font-black text-skin-text">{winRate}%</span>
                                </div>
                                <span className="text-xs text-skin-muted font-bold uppercase">Vitórias</span>
                            </div>
                        </div>

                        {/* Roles Stats */}
                        <div>
                            <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest mb-3">Desempenho por Função</h3>
                            <div className="space-y-4">
                                {/* Impostor */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2 text-red-500 font-bold">
                                            <Target size={14} /> Intruso
                                        </div>
                                        <span className="text-xs text-skin-muted">
                                            {stats.wins.impostor} vitórias ({stats.roles.impostor > 0 ? Math.round((stats.wins.impostor / stats.roles.impostor) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="h-3 w-full bg-skin-base border border-skin-border rounded-full overflow-hidden flex">
                                        {/* Win Part */}
                                        <div
                                            className="h-full bg-red-500 transition-all duration-1000"
                                            style={{ width: `${stats.roles.impostor > 0 ? (stats.wins.impostor / stats.roles.impostor) * 100 : 0}%` }}
                                        />
                                        {/* Loss Part (implicitly the rest, but we want to show Played vs Not Played ratio? No, usually Win vs Loss) */}
                                    </div>
                                    <div className="text-[10px] text-skin-muted text-right mt-0.5">Total: {stats.roles.impostor} jogos</div>
                                </div>

                                {/* Citizen */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2 text-purple-500 font-bold">
                                            <User size={14} /> Cidadão
                                        </div>
                                        <span className="text-xs text-skin-muted">
                                            {stats.wins.citizen} vitórias ({stats.roles.citizen > 0 ? Math.round((stats.wins.citizen / stats.roles.citizen) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="h-3 w-full bg-skin-base border border-skin-border rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-purple-500 transition-all duration-1000"
                                            style={{ width: `${stats.roles.citizen > 0 ? (stats.wins.citizen / stats.roles.citizen) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <div className="text-[10px] text-skin-muted text-right mt-0.5">Total: {stats.roles.citizen} jogos</div>
                                </div>
                            </div>
                        </div>

                        {/* Top Categories */}
                        {topCategories.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest mb-3">Top Categorias</h3>
                                <div className="flex flex-wrap gap-2">
                                    {topCategories.map(([cat, count]) => (
                                        <div key={cat} className="px-3 py-1 bg-skin-primary/10 border border-skin-primary/20 text-skin-primary rounded-lg text-xs font-bold flex items-center gap-2">
                                            <span>{cat}</span>
                                            <span className="bg-skin-primary/20 px-1.5 py-0.5 rounded text-[10px] text-skin-text">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent History */}
                        <div>
                            <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest mb-3">Histórico</h3>
                            {stats.history.length === 0 ? (
                                <p className="text-sm text-skin-muted italic">Ainda sem jogos...</p>
                            ) : (
                                <div className="space-y-2">
                                    {stats.history.slice(0, 5).map((h) => (
                                        <div key={h.gameId} className="flex items-center justify-between p-2 rounded bg-skin-base/30 border border-skin-border/50">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${h.won ? 'bg-green-500' : 'bg-skin-muted'}`} />
                                                <span className={`text-sm font-bold ${h.role === 'impostor' ? 'text-red-400' : 'text-purple-400'}`}>
                                                    {h.role === 'impostor' ? 'Intruso' : 'Cidadão'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-skin-muted">{h.category}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-skin-border bg-skin-base/50">
                        <Button
                            onClick={onReset}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 w-full"
                        >
                            <RotateCcw size={16} className="mr-2" /> Limpar Estatísticas
                        </Button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
