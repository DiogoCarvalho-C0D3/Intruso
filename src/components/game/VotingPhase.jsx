import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import { AlertTriangle } from 'lucide-react';

export default function VotingPhase({ gameState, onVote }) {
    const { currentUser, currentRoom } = useGame();
    const [selectedId, setSelectedId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived state: Have I effectively voted according to the server?
    const hasServerVote = gameState.votes && gameState.votes[currentUser.id];

    // UI is in "Confirmed" state if server has our vote OR we are currently sending it
    const showConfirmed = hasServerVote || isSubmitting;

    // Reset submitting state when server confirms vote
    if (hasServerVote && isSubmitting) {
        setIsSubmitting(false);
    }

    const handleVote = () => {
        if (selectedId) {
            setIsSubmitting(true);
            onVote(selectedId);
            // Safety timeout
            setTimeout(() => setIsSubmitting(false), 5000);
        }
    };

    if (showConfirmed) {
        return (
            <div className="view-container flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="mb-6 p-6 bg-skin-card rounded-full animate-pulse border border-skin-border">
                    <div className="w-12 h-12 border-4 border-t-skin-primary border-r-skin-primary border-b-transparent border-l-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-skin-text">{isSubmitting ? 'A enviar voto...' : 'Voto Confirmado'}</h2>
                <p className="text-skin-muted mb-8">A aguardar pelos outros jogadores...</p>

                <div className="flex gap-2 justify-center flex-wrap">
                    {currentRoom.players.map(p => {
                        // Check if this player has voted
                        const voted = gameState.votes && gameState.votes[p.id];
                        return (
                            <div key={p.id} className={`w-3 h-3 rounded-full transition-all duration-500 ${voted ? 'bg-skin-primary scale-125' : 'bg-skin-border'}`} />
                        );
                    })}
                </div>
            </div>
        );
    }

    const isRunoff = gameState.isRunoff;
    const isImpostor = gameState.impostorIds?.includes(currentUser.id);

    // Impostors cannot vote in Runoff (Tie-breaker)
    if (isRunoff && isImpostor) {
        return (
            <div className="view-container flex flex-col items-center justify-center p-6 text-center animate-fade-in relative">
                <div className="mb-6 p-6 bg-skin-card rounded-full border border-skin-border opacity-50">
                    <AlertTriangle size={48} className="text-skin-muted" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-skin-text">Desempate em Curso</h2>
                <p className="text-skin-muted max-w-xs mx-auto">
                    Como Intruso, não podes votar no desempate. Aguarda que os civis decidam o destino!
                </p>

                {/* Visual indicator of tie candidates */}
                <div className="mt-8 flex gap-4 opacity-50 grayscale">
                    {currentRoom.players.filter(p => gameState.runoffCandidates.includes(p.id)).map(p => (
                        <Avatar key={p.id} name={p.name} seed={p.avatarSeed} image={p.avatarType === 'custom' ? p.avatarImage : null} size="sm" accessory={p.accessory} />
                    ))}
                </div>
            </div>
        );
    }

    const candidates = isRunoff
        ? currentRoom.players.filter(p => gameState.runoffCandidates.includes(p.id))
        : currentRoom.players;

    return (
        <div className="view-container flex flex-col h-full relative">
            <div className="flex-none p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-4">
                    <AlertTriangle size={24} />
                </div>
                <h2 className="text-2xl font-black mb-1 text-skin-text">
                    {isRunoff ? 'DESEMPATE!' : 'Votação Final'}
                </h2>
                <p className="text-skin-muted text-sm">
                    {isRunoff ? 'Votação renhida! Escolhe entre os empatados.' : 'Quem achas que é o Intruso?'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24">
                <div className="grid grid-cols-2 gap-4">
                    {candidates.map(p => {
                        if (p.id === currentUser.id && !isRunoff) return null; // Can't vote for self in normal round? Actually usually you can, but here it was prevented. I'll keep logic but for Runoff allow voting for anyone in candidate list EXCEPT self if logic permits.
                        // Actually, allow voting for anyone in list.
                        if (p.id === currentUser.id) return null;

                        const isSelected = selectedId === p.id;

                        return (
                            <button
                                key={p.id}
                                onClick={() => setSelectedId(p.id)}
                                className={`relative p-4 rounded-2xl transition-all duration-200 group ${isSelected ? 'bg-skin-primary/10 border-2 border-skin-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.2)]' : 'bg-skin-card border-2 border-transparent hover:bg-skin-base'}`}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <Avatar
                                        name={p.name}
                                        seed={p.avatarSeed}
                                        image={p.avatarType === 'custom' ? p.avatarImage : null}
                                        size="lg"
                                        className={isSelected ? 'scale-110 transition-transform' : ''}
                                        accessory={p.accessory}
                                    />
                                    <span className={`font-bold text-sm truncate w-full ${isSelected ? 'text-skin-primary' : 'text-skin-muted'}`}>{p.name}</span>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-skin-primary rounded-full shadow-lg" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-none p-6 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-skin-fill-end via-skin-fill-end to-transparent z-10">
                <Button
                    onClick={handleVote}
                    disabled={!selectedId}
                    className="w-full text-lg shadow-xl shadow-skin-primary/20"
                    style={{ height: '60px' }}
                >
                    Confirmar Voto
                </Button>
            </div>
        </div>
    );
}
