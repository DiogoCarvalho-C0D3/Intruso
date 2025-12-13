import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useStatistics } from '../hooks/useStatistics';
import Layout from '../components/layout/Layout';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { ArrowLeft, Trophy, Crown, Skull, Search, Gamepad2, User, Target, RotateCcw, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../context/GameContext';

const TABS = [
    { id: 'totalGames', label: 'Viciados', description: 'Quem joga mais jogos', icon: Gamepad2, color: 'text-blue-400' },
    { id: 'impostorWins', label: 'Traidores', description: 'Quem tem mais vitórias como Intruso', icon: Skull, color: 'text-red-400' },
    { id: 'citizenWins', label: 'Detetives', description: 'Quem tem mais vitórias como Cidadão', icon: Search, color: 'text-green-400' },
    { id: 'impostorRate', label: 'Mestres', description: 'Melhor % de vitórias como Intruso (min. 3 jogos)', icon: Target, color: 'text-purple-400' },
    { id: 'citizenRate', label: 'Sherlocks', description: 'Melhor % de vitórias como Cidadão (min. 3 jogos)', icon: User, color: 'text-emerald-400' },
];

function StatsContent({ currentUser }) {
    const { stats, resetStats } = useStatistics(currentUser?.id);

    const winRate = stats.totalGames > 0
        ? Math.round(((stats.wins.impostor + stats.wins.citizen) / stats.totalGames) * 100)
        : 0;

    const topCategories = Object.entries(stats.categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-skin-card p-4 rounded-2xl border border-skin-border text-center flex flex-col items-center justify-center shadow-sm">
                    <span className="block text-4xl font-black text-skin-text">{stats.totalGames}</span>
                    <span className="text-xs text-skin-muted font-bold uppercase tracking-wider mt-1">Jogos</span>
                </div>
                <div className="bg-skin-card p-4 rounded-2xl border border-skin-border text-center flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `conic-gradient(var(--color-primary) ${winRate}%, transparent 0)`
                            }}
                        />
                        <div className="absolute inset-2 bg-skin-card rounded-full z-10" />
                        <span className="relative z-20 text-sm font-black text-skin-text">{winRate}%</span>
                    </div>
                    <span className="text-xs text-skin-muted font-bold uppercase tracking-wider">Vitórias</span>
                </div>
            </div>

            {/* Roles Stats */}
            <div className="bg-skin-card p-4 rounded-2xl border border-skin-border shadow-sm">
                <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Trophy size={14} className="text-yellow-500" /> Desempenho
                </h3>
                <div className="space-y-5">
                    {/* Impostor */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2 text-red-400 font-bold">
                                <Target size={16} /> Intruso
                            </div>
                            <span className="text-xs text-skin-muted font-medium">
                                {stats.wins.impostor} vitórias ({stats.roles.impostor > 0 ? Math.round((stats.wins.impostor / stats.roles.impostor) * 100) : 0}%)
                            </span>
                        </div>
                        <div className="h-4 w-full bg-skin-base border border-skin-border rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-red-500 transition-all duration-1000"
                                style={{ width: `${stats.roles.impostor > 0 ? (stats.wins.impostor / stats.roles.impostor) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-skin-muted text-right mt-1 font-bold">Total: {stats.roles.impostor} jogos</div>
                    </div>

                    {/* Citizen */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2 text-green-400 font-bold">
                                <User size={16} /> Cidadão
                            </div>
                            <span className="text-xs text-skin-muted font-medium">
                                {stats.wins.citizen} vitórias ({stats.roles.citizen > 0 ? Math.round((stats.wins.citizen / stats.roles.citizen) * 100) : 0}%)
                            </span>
                        </div>
                        <div className="h-4 w-full bg-skin-base border border-skin-border rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-green-500 transition-all duration-1000"
                                style={{ width: `${stats.roles.citizen > 0 ? (stats.wins.citizen / stats.roles.citizen) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-skin-muted text-right mt-1 font-bold">Total: {stats.roles.citizen} jogos</div>
                    </div>
                </div>
            </div>

            {/* Top Categories */}
            {topCategories.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest mb-3 px-1">Top Categorias</h3>
                    <div className="flex flex-wrap gap-2">
                        {topCategories.map(([cat, count]) => (
                            <div key={cat} className="px-4 py-2 bg-skin-card border border-skin-border text-skin-text rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                                <span>{cat}</span>
                                <span className="bg-skin-primary/10 text-skin-primary px-2 py-0.5 rounded-lg text-xs">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent History */}
            <div>
                <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest mb-3 px-1">Histórico</h3>
                {stats.history.length === 0 ? (
                    <div className="text-center py-8 bg-skin-card/50 rounded-2xl border border-skin-border border-dashed text-skin-muted italic text-sm">
                        Ainda sem jogos...
                    </div>
                ) : (
                    <div className="space-y-2">
                        {stats.history.slice(0, 5).map((h) => (
                            <div key={h.gameId} className="flex items-center justify-between p-3 rounded-xl bg-skin-card border border-skin-border/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${h.won ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                                    <span className={`text-sm font-bold ${h.role === 'impostor' ? 'text-red-400' : 'text-green-400'}`}>
                                        {h.role === 'impostor' ? 'Intruso' : 'Cidadão'}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-skin-muted px-2 py-1 bg-skin-base rounded-lg">{h.category}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-4">
                <Button
                    onClick={resetStats}
                    className="bg-red-500/5 text-red-500/70 hover:bg-red-500/10 hover:text-red-500 border border-red-500/10 w-full text-sm font-bold py-3 h-auto"
                >
                    <RotateCcw size={16} className="mr-2" /> Limpar Estatísticas
                </Button>
            </div>
        </motion.div>
    );
}

export default function LeaderboardView() {
    const navigate = useNavigate();
    const { currentUser } = useGame();
    const [activeTab, setActiveTab] = useState('totalGames');
    const [showProfile, setShowProfile] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
            return;
        }

        const handleData = (response) => {
            setData(response);
            setLoading(false);
        };

        socket.emit('request_leaderboard', { userId: currentUser.id });
        socket.on('leaderboard_data', handleData);

        return () => socket.off('leaderboard_data', handleData);
    }, [currentUser, navigate]);

    const currentCategory = data?.[activeTab];
    const top5 = currentCategory?.top || [];
    const userRank = currentCategory?.user;

    const activeTabInfo = TABS.find(t => t.id === activeTab);

    const header = (
        <div className="flex items-center gap-4 w-full h-full">
            <button
                onClick={() => navigate('/lobby')}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <ArrowLeft size={24} className="text-skin-text" />
            </button>
            <div className="flex-1">
                <h1 className="text-xl font-black text-skin-text uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-400" />
                    Classificação
                </h1>
            </div>
            <button
                onClick={() => setShowProfile(!showProfile)}
                className={`p-2 rounded-full transition-all ${showProfile ? 'bg-skin-primary text-white shadow-lg shadow-skin-primary/20' : 'bg-skin-card text-skin-muted hover:bg-white/10'}`}
            >
                <User size={20} />
            </button>
        </div>
    );

    return (
        <Layout className="flex flex-col h-full bg-skin-base" header={header}>

            {/* Tabs (Hidden if Profile is Open) */}
            {!showProfile && (
                <div className="flex flex-col border-b border-skin-border bg-skin-card">
                    <div className="flex p-2 gap-2 overflow-x-auto no-scrollbar">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap ${isActive
                                        ? 'bg-skin-primary text-white shadow-lg shadow-skin-primary/20'
                                        : 'bg-skin-base text-skin-muted hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-white' : tab.color} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    {/* Category Description */}
                    <div className="px-4 pb-3 pt-1 text-xs text-skin-muted flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${activeTabInfo.color.replace('text-', 'bg-')}`} />
                        {activeTabInfo?.description}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24 p-4">
                {showProfile ? (
                    <StatsContent currentUser={currentUser} />
                ) : loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-skin-primary"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-3"
                            >
                                {top5.map((player, index) => {
                                    const isFirst = index === 0;
                                    const isSecond = index === 1;
                                    const isThird = index === 2;

                                    return (
                                        <div
                                            key={index}
                                            className={`relative flex items-center gap-4 p-4 rounded-2xl border ${isFirst ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50' :
                                                isSecond ? 'bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/50' :
                                                    isThird ? 'bg-gradient-to-r from-orange-400/20 to-transparent border-orange-400/50' :
                                                        'bg-skin-card border-skin-border'
                                                } shadow-lg`}
                                        >
                                            <div className="font-black text-2xl w-8 text-center opacity-60 italic">
                                                #{index + 1}
                                            </div>

                                            <Avatar
                                                name={player.name}
                                                seed={player.avatarSeed}
                                                image={player.avatarType === 'custom' ? player.avatarImage : null}
                                                size="md"
                                                className="shadow-md"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-skin-text truncate text-lg flex items-center gap-2">
                                                    {player.name}
                                                    {isFirst && <Crown size={16} className="text-yellow-400 fill-yellow-400" />}
                                                </div>

                                            </div>

                                            <div className="text-xl font-bold text-skin-primary">
                                                {activeTab.includes('Rate')
                                                    ? `${Math.round(player.value)}%`
                                                    : player.value}
                                            </div>
                                        </div>
                                    );
                                })}

                                {top5.length === 0 && (
                                    <div className="text-center py-10 text-skin-muted italic opacity-50">
                                        Nenhum dado encontrado.
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* User Rank Sticky Footer */}
            {!loading && userRank && currentUser && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-skin-card border-t border-skin-border shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-30">
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-skin-base border border-skin-primary/50 shadow-inner">
                        <div className="font-black text-xl w-8 text-center text-skin-primary">
                            #{userRank.rank}
                        </div>

                        <Avatar
                            name={currentUser.name}
                            seed={currentUser.avatarSeed}
                            image={currentUser.avatarImage}
                            size="sm"
                            className="ring-2 ring-skin-primary"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-skin-text truncate text-sm">TU</div>
                        </div>

                        <div className="text-lg font-bold text-skin-primary">
                            {activeTab.includes('Rate')
                                ? `${Math.round(userRank.value)}%`
                                : userRank.value}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
