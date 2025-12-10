
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useStatistics } from '../hooks/useStatistics';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, BarChart2, Gift } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import StatsModal from '../components/ui/StatsModal';
import MissionsModal from '../components/ui/MissionsModal';
import Layout from '../components/layout/Layout';
import { REWARDS_MAP } from '../data/missions';

export default function HomeView() {
    const { login, currentUser } = useGame();
    const { stats, resetStats, equipReward } = useStatistics(null);

    const [name, setName] = useState('');
    const [discriminator, setDiscriminator] = useState('');
    const [avatarSeed, setAvatarSeed] = useState(Math.random().toString());
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isMissionsOpen, setIsMissionsOpen] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Derived equipped reward (Frame ID)
    const equippedAccessory = stats.equippedReward || null;

    useEffect(() => {
        if (currentUser) {
            navigate('/lobby');
        }
    }, [currentUser, navigate]);

    const handleEnter = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError('Precisas de um nome, agente!');
            return;
        }
        if (trimmedName.length < 2) {
            setError('Nome demasiado curto (min. 2).');
            return;
        }
        if (trimmedName.length > 12) {
            setError('Nome demasiado longo (max. 12).');
            return;
        }

        // Pass equippedAccessory and Discriminator
        try {
            login(trimmedName, avatarSeed, undefined, equippedAccessory, discriminator || null);
            navigate('/lobby');
        } catch (e) {
            setError(e.message);
        }
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        if (error) setError('');
    };

    return (
        <Layout className="flex flex-col items-center justify-center min-h-full">
            <StatsModal
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
                stats={stats}
                onReset={resetStats}
            />

            <MissionsModal
                isOpen={isMissionsOpen}
                onClose={() => setIsMissionsOpen(false)}
                stats={stats}
                onEquip={equipReward}
            />

            <div className="absolute top-4 right-4 flex gap-2">
                <button
                    onClick={() => setIsMissionsOpen(true)}
                    className="w-10 h-10 rounded-full bg-skin-card border border-skin-border flex items-center justify-center text-pink-400 shadow-lg hover:scale-105 transition-transform"
                >
                    <Gift size={20} />
                </button>
                <button
                    onClick={() => setIsStatsOpen(true)}
                    className="w-10 h-10 rounded-full bg-skin-card border border-skin-border flex items-center justify-center text-skin-primary shadow-lg hover:scale-105 transition-transform"
                >
                    <BarChart2 size={20} />
                </button>
            </div>

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
                            <div className="relative group cursor-pointer active:scale-95 transition-transform" onClick={() => setAvatarSeed(Math.random().toString())}>
                                <Avatar
                                    name={name || '?'}
                                    seed={avatarSeed}
                                    size="xl"
                                    className={`shadow-2xl border-4 transition-colors ${error ? 'border-red-500' : 'border-skin-border group-hover:border-skin-primary'}`}
                                    accessory={equippedAccessory}
                                />
                                <div className="absolute -bottom-2 -right-2 bg-skin-primary text-white p-2 rounded-full shadow-lg group-hover:rotate-180 transition-transform duration-500">
                                    <RefreshCw size={16} />
                                </div>
                            </div>
                            <span className="text-[10px] text-skin-muted uppercase tracking-widest font-bold">Toca para mudar</span>

                            {/* Name Input & Tag */}
                            <div className="w-full max-w-xs flex gap-2">
                                <input
                                    type="text"
                                    placeholder="NOME"
                                    value={name}
                                    onChange={handleNameChange}
                                    maxLength={15}
                                    className={`input input-bordered flex-1 bg-skin-base border-skin-border text-skin-text placeholder-skin-muted focus:ring-skin-primary transition-all text-center font-bold text-lg uppercase ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-skin-primary'}`}
                                />
                                <input
                                    type="text"
                                    placeholder="#0000"
                                    value={discriminator}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setDiscriminator(val);
                                    }}
                                    maxLength={4}
                                    className="input input-bordered w-24 bg-skin-base border-skin-border text-skin-text placeholder-skin-muted focus:ring-skin-primary transition-all text-center font-mono font-bold text-lg tracking-widest"
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-red-400 font-bold mt-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Helper Text */}
                            <div className="text-[10px] text-skin-muted text-center mt-2 max-w-xs leading-tight opacity-70">
                                <span className="font-bold">Dica:</span> Usa o teu código <span className="font-mono">#0000</span> apenas para recuperar uma conta antiga. Para novos jogos, deixa vazio!
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col items-center gap-4 mt-2">
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="btn btn-primary w-full max-w-xs font-bold shadow-lg shadow-skin-primary/20 disabled:opacity-50 disabled:shadow-none"
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
