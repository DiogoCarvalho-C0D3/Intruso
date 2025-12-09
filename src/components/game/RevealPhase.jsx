import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import { Eye, EyeOff, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RevealPhase({ gameState, onReady }) {
    const { currentUser, currentRoom } = useGame();
    const [revealed, setRevealed] = useState(false);
    const [hasRevealedOnce, setHasRevealedOnce] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    // Check if I am an impostor
    const isImpostor = gameState.impostorIds.includes(currentUser.id);
    const word = gameState.secretWord;

    const handleRevealToggle = () => {
        const newState = !revealed;
        setRevealed(newState);
        if (newState) setHasRevealedOnce(true);
    };

    const handleConfirm = () => {
        if (!hasRevealedOnce) return; // Prevention
        setConfirmed(true);
        onReady();
    };

    if (confirmed) {
        return (
            <div className="flex flex-col h-full animate-fade-in p-4">
                <div className="flex-none flex flex-col items-center justify-center py-6">
                    <div className="mb-4 text-green-500 bg-green-500/10 p-4 rounded-full ring-2 ring-green-500/20 shadow-lg shadow-green-500/10">
                        <Check size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black text-skin-text mb-2 text-center">Tudo a postos</h2>
                    <p className="text-skin-muted text-center max-w-xs">
                        Aguarda pelos outros jogadores. O jogo começará automaticamente.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto">
                    <div className="grid grid-cols-1 gap-3 pb-20">
                        {currentRoom.players.map(p => {
                            const isReady = (gameState.readyPlayers || []).includes(p.id);
                            return (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-500 ${isReady
                                        ? 'bg-skin-card/80 border-green-500/30 shadow-[0_4px_20px_-5px_rgba(34,197,94,0.15)]'
                                        : 'bg-skin-base/50 border-skin-border opacity-70'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar seed={p.avatarSeed || p.name} size="sm" className="ring-2 ring-skin-border" />
                                            {isReady && (
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-skin-card">
                                                    <Check size={10} className="text-white" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-sm ${isReady ? 'text-skin-text' : 'text-skin-muted'}`}>
                                                {p.name}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-skin-muted">
                                                {isReady ? 'Pronto' : 'A ver função...'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isReady ? 'bg-green-500/20 text-green-500' : 'bg-skin-base text-skin-muted'
                                        }`}>
                                        {isReady ? <Check size={18} /> : <Clock size={16} className="animate-pulse" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 h-full relative">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-skin-text mb-2 tracking-tight">A tua Função</h2>
                <p className="text-skin-muted text-sm font-medium">Mantém o ecrã escondido dos outros!</p>
            </div>

            <Card
                className="w-full max-w-[280px] aspect-[3/4.2] flex flex-col items-center justify-center mb-8 relative overflow-hidden cursor-pointer transition-transform active:scale-[0.98] focus:outline-none ring-offset-4 ring-offset-skin-base focus:ring-2 ring-skin-primary rounded-[2.5rem]"
                onClick={handleRevealToggle}
                style={{
                    border: revealed ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    background: revealed ? 'radial-gradient(circle at center, rgba(var(--color-primary-rgb), 0.15) 0%, rgba(var(--color-fill-rgb), 1) 100%)' : 'var(--color-surface)',
                    boxShadow: revealed ? '0 0 40px -10px rgba(var(--color-primary-rgb), 0.3)' : 'none'
                }}
            >
                <AnimatePresence mode="wait">
                    {!revealed ? (
                        <motion.div
                            key="hidden"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6 text-skin-muted"
                        >
                            <div className="bg-skin-card p-6 rounded-full border border-skin-border shadow-inner">
                                <Eye size={48} strokeWidth={1.5} />
                            </div>
                            <span className="text-xs uppercase tracking-[0.25em] font-bold text-skin-muted">Toque para revelar</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="revealed"
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="flex flex-col items-center gap-6 w-full px-4"
                        >
                            {isImpostor ? (
                                <>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-red-500/80">Função</span>
                                        <div className="text-red-500 font-black text-5xl tracking-tighter drop-shadow-2xl">INTRUSO</div>
                                    </div>
                                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                                    <p className="text-center text-sm text-skin-muted leading-relaxed max-w-[200px]">
                                        Não sabes a palavra secreta.<br />
                                        <strong className="text-skin-text">Descobre-a</strong> e mistura-te!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center gap-2 w-full">
                                        <span className="text-xs font-bold uppercase tracking-widest text-skin-primary/80">Palavra Secreta</span>
                                        <div className="text-skin-text font-black text-4xl break-words text-center w-full leading-tight uppercase relative z-10">
                                            {word}
                                        </div>
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-skin-primary/20 blur-xl -z-0"></div>
                                    </div>
                                    <p className="text-center text-sm text-skin-muted">
                                        Memoriza a palavra acima.
                                    </p>
                                </>
                            )}

                            <div className="absolute bottom-8 left-0 w-full flex justify-center">
                                <div className="text-[10px] uppercase tracking-widest text-skin-muted flex items-center gap-2 px-3 py-1 bg-skin-card/50 rounded-full border border-skin-border/50 backdrop-blur-sm">
                                    <EyeOff size={12} /> Toca para esconder
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            <div className="w-full max-w-[280px]">
                <Button
                    onClick={handleConfirm}
                    disabled={!hasRevealedOnce}
                    className={`h-16 text-lg rounded-2xl shadow-xl transition-all duration-500 ${hasRevealedOnce
                        ? 'translate-y-0 opacity-100 shadow-skin-primary/20 bg-skin-primary text-white'
                        : 'translate-y-4 opacity-50 grayscale'
                        }`}
                >
                    {hasRevealedOnce ? 'Entendido' : 'Vê a tua função'}
                </Button>
            </div>
        </div>
    );
}
