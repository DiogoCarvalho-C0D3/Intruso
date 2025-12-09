
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useStatistics } from '../hooks/useStatistics';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, BarChart2 } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import StatsModal from '../components/ui/StatsModal';
import Layout from '../components/layout/Layout';

export default function HomeView() {
    const { login, currentUser } = useGame();
    const { stats, resetStats } = useStatistics();

    const [name, setName] = useState('');
    const [avatarSeed, setAvatarSeed] = useState(Math.random().toString());
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/lobby');
        }
    }, [currentUser, navigate]);

    const handleEnter = (e) => {
        e.preventDefault();
        if (name.trim()) {
            login(name, avatarSeed);
            navigate('/lobby');
        }
    };

    return (
        <Layout className="flex flex-col items-center justify-center min-h-full">
            <StatsModal
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
                stats={stats}
                onReset={resetStats}
            />

            <div className="w-full max-w-sm flex flex-col items-center justify-center flex-1 py-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-skin-text to-skin-muted mb-2 tracking-tighter pb-2 px-2">
                        INTRUSO
                    </h1>
                    <p className="text-skin-muted font-medium tracking-wide">Descobre quem mente.</p>
                </motion.div>

                <motion.div
                    className="card w-full shadow-2xl shadow-skin-primary/10 bg-skin-card/80 backdrop-blur"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <form onSubmit={handleEnter} className="flex flex-col items-center p-2">
                        <div className="text-center mb-6">
                            <h2 className="text-lg font-bold text-skin-text mb-1">Identificação</h2>
                            <p className="text-sm text-skin-muted">Quem és tu, agente?</p>
                        </div>

                        {/* Avatar Selection */}
                        <div className="flex flex-col items-center gap-4 mb-6 w-full">
                            <div className="relative group cursor-pointer" onClick={() => setAvatarSeed(Math.random().toString())}>
                                <Avatar name={name} seed={avatarSeed} size="xl" className="shadow-2xl border-4 border-skin-border group-hover:border-skin-primary transition-colors" />
                                <div className="absolute -bottom-2 -right-2 bg-skin-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                    <RefreshCw size={16} />
                                </div>
                            </div>

                            {/* Name Input */}
                            <input
                                type="text"
                                placeholder="O teu nome de agente"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input input-bordered w-full max-w-xs bg-skin-base border-skin-border text-skin-text placeholder-skin-muted focus:border-skin-primary focus:ring-skin-primary"
                                required
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col items-center gap-4">
                            <button
                                type="submit"
                                className="btn btn-primary w-full max-w-xs font-bold"
                            >
                                Identificar-me
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </Layout>
    );
}
