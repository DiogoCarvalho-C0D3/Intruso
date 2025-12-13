import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useStatistics } from '../hooks/useStatistics';
import Layout from '../components/layout/Layout';
import Avatar from '../components/ui/Avatar';
import { ArrowLeft, Trophy, Crown, Skull, Search, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../context/GameContext';

const TABS = [
    { id: 'totalGames', label: 'Viciados', icon: Gamepad2, color: 'text-blue-400' },
    { id: 'impostorWins', label: 'Traidores', icon: Skull, color: 'text-red-400' },
    { id: 'citizenWins', label: 'Detetives', icon: Search, color: 'text-green-400' },
];

export default function LeaderboardView() {
    const navigate = useNavigate();
    const { currentUser } = useGame();
    const [activeTab, setActiveTab] = useState('totalGames');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            // Should not happen usually as accessed from lobby
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

    return (
        <Layout className="flex flex-col h-full bg-skin-base">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 sticky top-0 bg-skin-base/90 backdrop-blur z-20 border-b border-skin-border">
                <button
                    onClick={() => navigate('/lobby')}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={24} className="text-skin-text" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-skin-text uppercase tracking-widest flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-400" />
                        Classificação
                    </h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 overflow-x-auto no-scrollbar border-b border-skin-border bg-skin-card">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap ${isActive
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24 p-4">
                {loading ? (
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
                                                image={player.avatarImage}
                                                size="md"
                                                className="shadow-md"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-skin-text truncate text-lg flex items-center gap-2">
                                                    {player.name}
                                                    {isFirst && <Crown size={16} className="text-yellow-400 fill-yellow-400" />}
                                                </div>
                                                <div className="text-xs text-skin-muted font-mono">#{player.discriminator}</div>
                                            </div>

                                            <div className="text-xl font-bold text-skin-primary">
                                                {player.value}
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
                            {userRank.value}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
