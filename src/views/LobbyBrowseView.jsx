import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useStatistics } from '../hooks/useStatistics';
import Avatar from '../components/ui/Avatar';
import MissionsModal from '../components/ui/MissionsModal';
import SettingsModal from '../components/ui/SettingsModal';
import Layout from '../components/layout/Layout';
import { Plus, Search, LogOut, WifiOff, Users, ArrowRight, BarChart2, Settings, Gift, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { REWARDS_MAP } from '../data/missions';

export default function LobbyBrowseView() {
    const { currentUser, logout, updateProfile, createRoom, joinRoom, publicRooms, onlineUsers, isConnected, error } = useGame();
    const { stats, resetStats, equipReward } = useStatistics(currentUser?.id);
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [isMissionsOpen, setIsMissionsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) navigate('/');
    }, [currentUser, navigate]);

    const { currentRoom } = useGame();
    useEffect(() => {
        if (currentRoom) {
            navigate(`/room/${currentRoom.id}`);
        }
    }, [currentRoom, navigate]);

    const handleCreate = () => createRoom();

    const handleJoinCode = (e) => {
        e.preventDefault();
        if (!joinCode) return;
        joinRoom(joinCode);
    };

    const header = (
        <>
            <div className="flex items-center gap-3">
                <Avatar
                    name={currentUser?.name}
                    seed={currentUser?.avatarSeed}
                    image={currentUser?.avatarType === 'custom' ? currentUser?.avatarImage : null}
                    size="sm"
                    accessory={currentUser?.accessory}
                />
                <div className="flex flex-col">
                    <span className="font-bold text-sm leading-none text-skin-text">
                        {currentUser?.name}
                        <span className="text-skin-muted font-normal opacity-50 ml-0.5">#{currentUser?.discriminator}</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                        {isConnected ? (
                            <span className="text-emerald-400">● Online</span>
                        ) : (
                            <span className="text-red-400 flex items-center gap-1"><WifiOff size={10} /> Offline</span>
                        )}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsMissionsOpen(true)}
                    className="w-10 h-10 rounded-full bg-skin-card flex items-center justify-center text-pink-400 hover:text-pink-500 hover:bg-pink-500/10 transition-colors"
                    title="Missões"
                >
                    <Gift size={18} />
                </button>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-10 h-10 rounded-full bg-skin-card flex items-center justify-center text-skin-muted hover:text-skin-text hover:bg-skin-border transition-colors"
                    title="Definições"
                >
                    <Settings size={18} />
                </button>

                <button
                    onClick={() => navigate('/leaderboard')}
                    className="w-10 h-10 rounded-full bg-skin-card flex items-center justify-center text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                    title="Classificação"
                >
                    <Trophy size={18} />
                </button>
                <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-10 h-10 rounded-full bg-skin-card flex items-center justify-center text-skin-muted hover:text-skin-text hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="Sair"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </>
    );

    return (
        <Layout header={header}>
            <MissionsModal
                isOpen={isMissionsOpen}
                onClose={() => setIsMissionsOpen(false)}
                stats={stats}
                onEquip={(id) => {
                    equipReward(id);
                    // Pass ID directly so Avatar can lookup frame class
                    updateProfile({ accessory: id });
                }}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={currentUser}
                onSave={updateProfile}
            />

            <div className="space-y-6 pb-20">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-center text-sm font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Main Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleCreate}
                        disabled={!isConnected}
                        className="flex flex-col items-center justify-center gap-3 bg-skin-primary hover:bg-skin-primary-hover active:scale-95 text-white p-6 rounded-2xl transition-all shadow-lg shadow-skin-primary/20 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wide">Criar Sala</span>
                    </button>

                    <div className="bg-skin-card p-4 rounded-2xl border border-skin-border flex flex-col justify-between gap-3">
                        <span className="text-[10px] font-bold uppercase text-skin-muted tracking-wider text-center">Entrar c/ Código</span>
                        <div className="flex items-center gap-2 bg-skin-base rounded-xl p-1 pr-2 border border-skin-border focus-within:border-skin-primary transition-colors">
                            <input
                                className="bg-transparent w-full p-2 text-center text-lg font-mono tracking-widest outline-none placeholder-skin-muted uppercase text-skin-text"
                                placeholder="000000"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                maxLength={6}
                            />
                            <button
                                onClick={handleJoinCode}
                                disabled={!joinCode || !isConnected}
                                className="w-8 h-8 bg-skin-primary hover:bg-skin-primary-hover text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:bg-skin-border transition-colors"
                            >
                                <Search size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Online Players */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest flex items-center gap-2 px-1">
                        <Users size={14} />
                        Agentes Online ({onlineUsers.length})
                    </h3>
                    <div className="bg-skin-card/50 rounded-2xl border border-skin-border p-4 flex gap-4 overflow-x-auto scrollbar-hide">
                        {onlineUsers.length === 0 ? (
                            <span className="text-sm text-skin-muted italic w-full text-center py-2">A procurar agentes...</span>
                        ) : (
                            onlineUsers.map((u, i) => (
                                <div key={u.socketId || i} className="flex flex-col items-center gap-2 min-w-[60px]">
                                    <Avatar
                                        name={u.name}
                                        seed={u.avatarSeed || u.name}
                                        image={u.avatarType === 'custom' ? u.avatarImage : null}
                                        size="sm"
                                        className="border-2 border-skin-border"
                                        accessory={u.accessory}
                                    />
                                    <span className="text-[10px] font-medium text-skin-muted truncate max-w-full">{u.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Public Rooms */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-skin-muted uppercase tracking-widest px-1">Salas Públicas</h3>
                    <div className="space-y-3">
                        {publicRooms.length === 0 ? (
                            <div className="text-center py-10 opacity-50 bg-skin-card/50 rounded-2xl border border-skin-border border-dashed text-skin-muted">
                                <p className="text-sm">Nenhuma sala pública.</p>
                                <p className="text-xs mt-1">Sê o primeiro a criar!</p>
                            </div>
                        ) : (
                            publicRooms.map(room => (
                                <div
                                    key={room.id}
                                    onClick={() => joinRoom(room.id)}
                                    className="group bg-skin-card hover:bg-skin-border/50 p-4 rounded-xl border border-skin-border hover:border-skin-primary/50 transition-all cursor-pointer flex items-center justify-between"
                                >
                                    <div>
                                        <div className="font-bold text-skin-text mb-1 group-hover:text-skin-primary transition-colors">{room.name}</div>
                                        <div className="text-xs text-skin-muted font-medium">
                                            <span className="bg-skin-base px-2 py-0.5 rounded text-skin-text border border-skin-border">{room.players.length}/{room.settings.maxPlayers}</span>
                                            <span className="mx-2">•</span>
                                            <span>{(room.settings.categories || []).slice(0, 2).join(', ')}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-skin-base group-hover:bg-skin-primary flex items-center justify-center transition-colors text-skin-text group-hover:text-white">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
