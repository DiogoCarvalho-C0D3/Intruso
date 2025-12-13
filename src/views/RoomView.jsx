import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { CATEGORIES, getRandomWord } from '../data/categories';
import Avatar from '../components/ui/Avatar';
import Layout from '../components/layout/Layout';
import { Minus, Plus, Edit2, LogOut, Copy, Check, Play, Crown, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS = {
    'Geral': '🎲',
    'Animais': '🦁',
    'Comida': '🍕',
    'Lugares': '🗺️',
    'Objetos': '💡',
    'Desporto': '⚽',
    'Profissões': '👨‍⚕️',
    'Cinema': '🎬',
    'Tecnologia': '💻',
    'Países': '🌍',
    'Marcas': '🏷️'
};

const SettingCounter = ({ label, value, onDecrease, onIncrease, min, max, isHost, suffix = '' }) => (
    <div className="flex items-center justify-between bg-skin-base/50 p-3 rounded-xl border border-skin-border">
        <span className="text-xs font-bold uppercase tracking-wider text-skin-muted">{label}</span>

        <div className="flex items-center gap-2">
            {isHost ? (
                <div className="flex items-center bg-skin-card rounded-full p-1 border border-skin-border">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDecrease(); }}
                        disabled={value <= min}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-skin-muted hover:text-skin-text hover:bg-skin-base transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <Minus size={14} strokeWidth={2.5} />
                    </button>

                    <span className="text-lg font-bold w-10 text-center text-skin-text">{value}{suffix}</span>

                    <button
                        onClick={(e) => { e.stopPropagation(); onIncrease(); }}
                        disabled={value >= max}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-skin-primary text-white hover:bg-skin-primary-hover transition-colors disabled:opacity-30 disabled:bg-skin-border disabled:text-skin-muted"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                    </button>
                </div>
            ) : (
                <span className="bg-skin-card text-skin-text px-4 py-1.5 rounded-full font-bold border border-skin-border">{value}{suffix}</span>
            )}
        </div>
    </div>

);

const SettingSwitch = ({ label, value, onChange, isHost }) => (
    <div className="flex items-center justify-between bg-skin-base/50 p-3 rounded-xl border border-skin-border">
        <span className="text-xs font-bold uppercase tracking-wider text-skin-muted">{label}</span>
        {isHost ? (
            <button
                onClick={(e) => { e.stopPropagation(); onChange(!value); }}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out border-2 border-transparent ${value ? 'bg-skin-primary' : 'bg-skin-card border-skin-border'}`}
            >
                <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
        ) : (
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${value ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-skin-card text-skin-muted border-skin-border'}`}>
                {value ? 'Sim' : 'Não'}
            </span>
        )}
    </div>
);

export default function RoomView() {
    const { roomId } = useParams();
    const { currentRoom, currentUser, joinRoom, leaveRoom, updateRoomSettings, startGame, error } = useGame();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const userIntendsToLeave = useRef(false);

    // Room Name Editing
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (currentRoom) setNewName(currentRoom.name);
    }, [currentRoom]);

    const saveRoomName = () => {
        if (newName.trim() && newName !== currentRoom.name) {
            updateRoomSettings({ name: newName.trim() });
        }
        setIsEditingName(false);
    };

    useEffect(() => {
        if (!currentRoom && roomId && !userIntendsToLeave.current) {
            try { joinRoom(roomId); } catch (e) { }
        }
    }, [roomId, currentRoom, joinRoom]);

    useEffect(() => {
        if (currentRoom?.status === 'PLAYING') {
            navigate(`/game/${currentRoom.id}`);
        }
    }, [currentRoom, navigate]);

    const handleLeave = () => {
        userIntendsToLeave.current = true;
        leaveRoom();
        navigate('/lobby');
    };

    // Robustness: If error occurs while loading (e.g. Room not found), go to lobby
    useEffect(() => {
        if (!currentRoom && error) {
            // Give user a moment to see toast if we had one, but here we just redirect
            // Actually, let's just go to lobby to avoid stuck screen
            const timer = setTimeout(() => navigate('/lobby'), 2000); // 2s delay to show error maybe?
            // But we don't show error if !currentRoom, we show "A carregar"
            // So we should navigate immediately.
            navigate('/lobby');
        }
    }, [currentRoom, error, navigate]);

    // Handle Aborted status here too
    useEffect(() => {
        if (currentRoom?.status === 'ABORTED') {
            navigate('/lobby');
        }
    }, [currentRoom, navigate]);

    if (!currentRoom) return (
        <Layout className="flex items-center justify-center">
            {error ? (
                <div className="flex flex-col items-center gap-4 text-center p-8 animate-fade-in">
                    <LogOut size={48} className="text-red-500 mb-2" />
                    <p className="text-skin-text font-bold text-lg">{error}</p>
                    <button onClick={() => navigate('/lobby')} className="btn btn-primary">Voltar ao Lobby</button>
                </div>
            ) : (
                <span className="text-skin-muted animate-pulse">A carregar sala...</span>
            )}
        </Layout>
    );

    const isHost = currentRoom.hostId === currentUser?.id;

    const handleStart = () => {
        const categories = currentRoom.settings.categories || ['Geral'];
        const difficulty = currentRoom.settings.difficulty || 'medium';
        const { word: secretWord, category: selectedCategory } = getRandomWord(categories, difficulty);
        const playerCount = currentRoom.players.length;
        let impostorCount = currentRoom.settings.impostorCount;
        const maxImpostors = Math.floor(playerCount / 2) || 1;
        if (impostorCount >= playerCount) impostorCount = playerCount - 1;
        if (impostorCount < 1) impostorCount = 1;

        const playerIds = currentRoom.players.map(p => p.id);
        const shuffled = [...playerIds].sort(() => 0.5 - Math.random());
        const impostorIds = shuffled.slice(0, impostorCount);
        const turnOrder = [...playerIds].sort(() => 0.5 - Math.random());

        const gameData = {
            secretWord,
            category: selectedCategory, // Save the specific category
            impostorIds,
            turnOrder,
            currentTurnIndex: 0,
            phase: 'REVEAL',
            round: 1,
            totalRounds: currentRoom.settings.rounds,
            votes: {},
            gameId: null // will be set by server
        };
        startGame(gameData);
    };

    const toggleCategory = (cat) => {
        const currentCats = currentRoom.settings.categories || ['Geral'];
        let newCats;
        if (currentCats.includes(cat)) {
            if (currentCats.length === 1) return;
            newCats = currentCats.filter(c => c !== cat);
        } else {
            newCats = [...currentCats, cat];
        }
        updateRoomSettings({ categories: newCats });
    };

    const cycleDifficulty = (direction) => {
        const levels = ['easy', 'medium', 'hard'];
        const current = currentRoom.settings.difficulty || 'medium';
        const idx = levels.indexOf(current);
        let newIdx = idx + direction;
        if (newIdx < 0) newIdx = 0;
        if (newIdx >= levels.length) newIdx = levels.length - 1;
        updateRoomSettings({ difficulty: levels[newIdx] });
    };

    const copyCode = () => {
        navigator.clipboard.writeText(currentRoom.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const maxPotentialPlayers = currentRoom.settings.maxPlayers || 8;
    const maxConfigurableImpostors = Math.max(1, Math.floor(maxPotentialPlayers / 2));

    // Helper text for difficulty
    const DIFF_LABELS = { 'easy': 'Fácil', 'medium': 'Médio', 'hard': 'Difícil' };

    const header = (
        <>
            <div className="flex-1 min-w-0 mr-4">
                {isHost && isEditingName ? (
                    <input
                        autoFocus
                        className="bg-transparent border-b border-skin-primary text-lg font-bold w-full outline-none pb-1 text-skin-text placeholder-skin-muted"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={saveRoomName}
                        onKeyDown={(e) => e.key === 'Enter' && saveRoomName()}
                    />
                ) : (
                    <div
                        className={`flex flex-col ${isHost ? 'cursor-pointer group' : ''}`}
                        onClick={() => isHost && setIsEditingName(true)}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-skin-muted mb-0.5">Sala de Espera</span>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-skin-text truncate max-w-full">{currentRoom.name}</h2>
                            {isHost && <Edit2 size={12} className="text-skin-muted group-hover:text-skin-primary transition-colors" />}
                        </div>
                    </div>
                )}
            </div>
            <button
                onClick={handleLeave}
                className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Sair da Sala"
            >
                <LogOut size={18} strokeWidth={2} />
            </button>
        </>
    );

    const footer = isHost ? (
        <button
            className="btn btn-primary w-full h-14 text-lg shadow-xl shadow-skin-primary/20"
            onClick={handleStart}
            disabled={currentRoom.players.length < 3}
        >
            <Play size={24} strokeWidth={2} className="mr-3" fill="currentColor" /> INICIAR JOGO
        </button>
    ) : (
        <div className="w-full h-14 bg-skin-card/50 rounded-2xl flex items-center justify-center text-skin-muted font-bold border border-skin-border animate-pulse">
            À espera do anfitrião...
        </div>
    );

    return (
        <Layout header={header} footer={footer}>
            <div className="space-y-6 pb-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-center text-sm">
                        {error}
                    </div>
                )}

                {/* Elegant Code Pill */}
                <div className="flex justify-center -mt-2">
                    <button
                        onClick={copyCode}
                        className="relative group bg-skin-card border border-skin-border rounded-full pl-5 pr-4 py-2 flex items-center gap-3 hover:border-skin-primary/50 transition-all active:scale-95 shadow-lg"
                    >
                        <AnimatePresence>
                            {copied && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                                >
                                    Copiado!
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <span className="text-[10px] font-bold uppercase tracking-widest text-skin-muted">Código</span>
                        <span className="text-xl font-black text-skin-text tracking-widest font-mono">{currentRoom.code}</span>
                        {copied ?
                            <Check size={16} className="text-green-500" /> :
                            <Copy size={16} className="text-skin-muted group-hover:text-skin-primary transition-colors" />
                        }
                    </button>


                    {/* Private Room Toggle - New Location */}
                    <button
                        onClick={() => isHost && updateRoomSettings({ isPrivate: !currentRoom.isPrivate })}
                        className={`flex items-center justify-center w-10 h-10 rounded-full border shadow-lg transition-all active:scale-95 ml-2 ${currentRoom.isPrivate
                            ? 'bg-skin-primary text-white border-transparent'
                            : 'bg-skin-card border-skin-border text-skin-muted hover:border-skin-primary hover:text-skin-primary'
                            } ${!isHost ? 'opacity-50 cursor-default' : ''}`}
                        title={currentRoom.isPrivate ? "Sala Privada (Toque para abrir)" : "Sala Pública (Toque para fechar)"}
                        disabled={!isHost}
                    >
                        {currentRoom.isPrivate ? <Lock size={18} /> : <Globe size={18} />}
                    </button>
                </div>

                {/* Players List (Horizontal Scroll) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-skin-muted">Agentes</h3>
                        <span className="text-xs font-bold bg-skin-border text-skin-muted px-2 py-0.5 rounded">
                            {currentRoom.players.length} / {currentRoom.settings.maxPlayers || 8}
                        </span>
                    </div>

                    <div className="flex overflow-x-auto pb-4 pt-4 gap-4 px-2 -mx-2 snap-x hide-scrollbar">
                        {currentRoom.players.map(p => (
                            <div key={p.id} className="flex flex-col items-center gap-2 relative group min-w-[70px] snap-center">
                                <div className="relative">
                                    <Avatar
                                        name={p.name}
                                        seed={p.avatarSeed}
                                        image={p.avatarType === 'custom' ? p.avatarImage : null}
                                        size="md"
                                        className={`border-2 shadow-lg transition-transform hover:scale-105 ${p.id === currentRoom.hostId ? 'border-yellow-500/50' : 'border-skin-border'}`}
                                        accessory={p.accessory}
                                    />
                                    {p.id === currentRoom.hostId && (
                                        <div className="absolute -top-2 -left-2 bg-yellow-500 text-black p-1 rounded-full shadow-lg z-10">
                                            <Crown size={10} fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-skin-muted font-bold truncate max-w-full px-1 py-0.5 rounded bg-skin-card/50 w-full text-center">
                                    {p.name}
                                </span>
                            </div>
                        ))}
                        {/* Empty slots placeholders */}
                        {Array.from({ length: Math.max(0, (currentRoom.settings.maxPlayers || 8) - currentRoom.players.length) }).slice(0, 4).map((_, i) => (
                            <div key={`e-${i}`} className="flex flex-col items-center gap-2 opacity-20 min-w-[70px]">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-skin-muted bg-skin-card/50"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings Section */}
                <div className="space-y-4 pt-4 border-t border-skin-border">
                    <h3 className="text-lg font-bold text-skin-text px-1">Missão</h3>

                    <div className="space-y-3">
                        <SettingCounter label="Rondas" value={currentRoom.settings.rounds} isHost={isHost} min={1} max={10} onDecrease={() => updateRoomSettings({ rounds: currentRoom.settings.rounds - 1 })} onIncrease={() => updateRoomSettings({ rounds: currentRoom.settings.rounds + 1 })} />

                        <SettingCounter label="Intrusos" value={currentRoom.settings.impostorCount} isHost={isHost} min={1} max={maxConfigurableImpostors} onDecrease={() => updateRoomSettings({ impostorCount: currentRoom.settings.impostorCount - 1 })} onIncrease={() => updateRoomSettings({ impostorCount: currentRoom.settings.impostorCount + 1 })} />

                        <SettingCounter label="Lotação" value={currentRoom.settings.maxPlayers || 8} isHost={isHost} min={3} max={9} onDecrease={() => updateRoomSettings({ maxPlayers: (currentRoom.settings.maxPlayers || 8) - 1 })} onIncrease={() => updateRoomSettings({ maxPlayers: (currentRoom.settings.maxPlayers || 8) + 1 })} />



                        {/* Difficulty Stepper */}
                        <div className="flex items-center justify-between bg-skin-base/50 p-3 rounded-xl border border-skin-border">
                            <span className="text-xs font-bold uppercase tracking-wider text-skin-muted">Dificuldade</span>

                            <div className="flex items-center gap-2">
                                {isHost ? (
                                    <div className="flex items-center bg-skin-card rounded-full p-1 border border-skin-border">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); cycleDifficulty(-1); }}
                                            disabled={currentRoom.settings.difficulty === 'easy'}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-skin-muted hover:text-skin-text hover:bg-skin-base transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                        >
                                            <Minus size={14} strokeWidth={2.5} />
                                        </button>

                                        <span className="text-sm font-bold w-20 text-center text-skin-text truncate px-1">
                                            {DIFF_LABELS[currentRoom.settings.difficulty || 'medium']}
                                        </span>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); cycleDifficulty(1); }}
                                            disabled={currentRoom.settings.difficulty === 'hard'}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-skin-primary text-white hover:bg-skin-primary-hover transition-colors disabled:opacity-30 disabled:bg-skin-border disabled:text-skin-muted"
                                        >
                                            <Plus size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="bg-skin-card text-skin-text px-4 py-1.5 rounded-full font-bold border border-skin-border text-sm">
                                        {DIFF_LABELS[currentRoom.settings.difficulty || 'medium']}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-skin-muted px-1">Categorias</label>
                        {isHost ? (
                            <div className="grid grid-cols-3 gap-2">
                                {Object.keys(CATEGORIES).map(c => {
                                    const isSelected = (currentRoom.settings.categories || ['Geral']).includes(c);
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => toggleCategory(c)}
                                            className={`flex flex-row items-center justify-start gap-2 px-3 py-2 rounded-xl border transition-all active:scale-95 ${isSelected ? 'bg-skin-primary/10 border-skin-primary/50' : 'bg-skin-card border-skin-border hover:bg-skin-base'}`}
                                        >
                                            <span className="text-lg leading-none">{CATEGORY_ICONS[c] || '📦'}</span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wide truncate flex-1 text-left ${isSelected ? 'text-skin-primary' : 'text-skin-muted'}`}>{c}</span>
                                            {isSelected && <div className="w-1.5 h-1.5 bg-skin-primary rounded-full" />}
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {(currentRoom.settings.categories || ['Geral']).map(c => (
                                    <div key={c} className="flex items-center gap-2 px-3 py-1.5 bg-skin-card rounded-lg border border-skin-border">
                                        <span className="text-lg leading-none">{CATEGORY_ICONS[c] || '📦'}</span>
                                        <span className="text-xs font-bold text-skin-muted">{c}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout >
    );
}
