import { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useStatistics } from '../../hooks/useStatistics';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import { Crown, Skull, RotateCcw, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResultPhase({ gameState, onRestart }) {
    const { currentRoom, currentUser, leaveRoom } = useGame();
    const { recordGame } = useStatistics(currentUser?.id);

    // Calculate results
    const votes = gameState.votes;
    const impostorIds = gameState.impostorIds;
    const secretWord = gameState.secretWord;

    // Count votes
    const voteCounts = {}; // All votes (for display if needed, though we primarily use valid)
    const validVoteCounts = {}; // For actual score
    let totalValidVotes = 0;

    Object.entries(votes).forEach(([voterId, votedId]) => {
        voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;

        if (!impostorIds.includes(voterId)) {
            validVoteCounts[votedId] = (validVoteCounts[votedId] || 0) + 1;
            totalValidVotes++;
        }
    });

    // Find who got most VALID votes
    let maxVotes = 0;
    let mostVotedIds = [];
    Object.entries(validVoteCounts).forEach(([id, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            mostVotedIds = [id];
        } else if (count === maxVotes) {
            mostVotedIds.push(id);
        }
    });

    // Determine winners
    const eliminatedId = mostVotedIds.length === 1 ? mostVotedIds[0] : null;
    const impostorCaught = eliminatedId && impostorIds.includes(eliminatedId);
    const citizensWin = impostorCaught;

    // Personal Result Logic
    const isImpostor = impostorIds.includes(currentUser.id);
    const didIWin = (isImpostor && !citizensWin) || (!isImpostor && citizensWin);

    // Stats Recording (Side Effect)
    useEffect(() => {
        if (!currentUser || !gameState.gameId) return;

        recordGame({
            gameId: gameState.gameId,
            role: isImpostor ? 'impostor' : 'citizen',
            won: didIWin,
            category: gameState.category
        });
    }, [gameState.gameId]);

    const VictoryIcon = didIWin ? Crown : Skull;
    const bannerColor = didIWin ? 'bg-green-500 text-slate-900 shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20';
    const bannerText = didIWin ? 'Vitória!' : 'Derrota...';
    const subText = citizensWin ? 'Os Cidadãos ganharam.' : 'O Intruso ganhou.';

    return (
        <div className="view-container flex flex-col h-full overflow-hidden">

            <div className="flex-1 overflow-y-auto p-6 pb-24">
                {/* VICTORY BANNER */}
                <div className="text-center mb-8 relative">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className={`inline-flex items-center justify-center p-6 rounded-full mb-4 shadow-2xl ${bannerColor}`}
                    >
                        <VictoryIcon size={64} strokeWidth={1.5} />
                    </motion.div>

                    <h2 className="text-4xl font-black mb-2 leading-tight tracking-tight text-skin-text">
                        {bannerText}
                    </h2>
                    <p className="text-skin-muted font-bold uppercase tracking-wider text-sm mb-4">{subText}</p>

                    <div className="inline-block px-4 py-2 bg-skin-base/50 rounded-xl border border-skin-border mt-2">
                        <p className="text-sm text-skin-muted uppercase tracking-wider font-bold mb-1">A palavra era</p>
                        <p className="text-2xl font-black text-skin-text tracking-wide">{secretWord}</p>
                    </div>
                </div>

                {/* IMPOSTOR REVEAL */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-skin-muted mb-4 uppercase tracking-widest pl-2 border-l-2 border-red-500 ml-1">O Intruso Era</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {currentRoom.players
                            .filter(p => impostorIds.includes(p.id))
                            .map(p => (
                                <div key={p.id} className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-red-500/5 z-0" />
                                    <Avatar
                                        name={p.name}
                                        seed={p.avatarSeed}
                                        image={p.avatarType === 'custom' ? p.avatarImage : null}
                                        size="lg"
                                        className="border-2 border-red-500 z-10"
                                        accessory={p.accessory}
                                    />
                                    <div className="z-10">
                                        <div className="text-xl font-bold text-skin-text">{p.name}</div>
                                        <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Inimigo no meio de nós</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* VOTES CHART */}
                <div>
                    <h3 className="text-xs font-bold text-skin-muted mb-4 uppercase tracking-widest pl-2 border-l-2 border-skin-primary ml-1">Resultados da Votação</h3>
                    <div className="space-y-4">
                        {Object.entries(voteCounts)
                            .sort(([idA], [idB]) => (validVoteCounts[idB] || 0) - (validVoteCounts[idA] || 0)) // Sort by VALID votes
                            .map(([playerId, _totalCount]) => { // We ignore totalCount for the bar, use valid
                                const player = currentRoom.players.find(p => p.id === playerId);
                                if (!player) return null;

                                const validCount = validVoteCounts[playerId] || 0;
                                const percentage = totalValidVotes > 0 ? Math.round((validCount / totalValidVotes) * 100) : 0;
                                const isEliminated = playerId === eliminatedId;

                                // Find who voted for this person
                                const voters = Object.entries(votes)
                                    .filter(([_, target]) => target === playerId)
                                    .map(([voterId]) => {
                                        const v = currentRoom.players.find(p => p.id === voterId);
                                        const isVoterImpostor = impostorIds.includes(voterId);
                                        return { name: v ? v.name : 'Desconhecido', isImpostor: isVoterImpostor };
                                    });

                                return (
                                    <div key={playerId} className="relative">
                                        <div className="flex items-end justify-between mb-1 px-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${isEliminated ? 'text-red-400' : 'text-skin-text'}`}>{player.name}</span>
                                                {isEliminated && <span className="text-[10px] bg-red-500 text-white px-1 rounded uppercase font-bold">Eliminado</span>}
                                            </div>
                                            <span className="text-xs font-bold text-skin-muted">{validCount} votos válidos ({percentage}%)</span>
                                        </div>

                                        {/* Bar */}
                                        <div className="h-4 w-full bg-skin-base rounded-full overflow-hidden mb-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={`h-full ${isEliminated ? 'bg-red-500' : 'bg-skin-primary'}`}
                                            />
                                        </div>

                                        {/* Voter Avatars/Names */}
                                        <div className="flex flex-wrap gap-1 mb-4 pl-1">
                                            {voters.map((v, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-[10px] px-2 py-0.5 rounded border ${v.isImpostor ? 'bg-red-500/10 text-red-400 border-red-500/20 line-through decoration-red-500/50' : 'bg-skin-base/50 text-skin-muted border-skin-border/50'}`}
                                                    title={v.isImpostor ? "Voto de Intruso (Não conta)" : ""}
                                                >
                                                    {v.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            <div className="flex-none p-6 pt-0 bg-gradient-to-t from-skin-fill-end via-skin-fill-end to-transparent z-10 sticky bottom-0 flex flex-col gap-3">
                <Button onClick={onRestart} className="w-full text-lg shadow-xl shadow-skin-primary/10" style={{ height: '56px' }}>
                    <RotateCcw size={20} className="mr-2" /> Jogar Novamente
                </Button>

                <button
                    onClick={leaveRoom}
                    className="w-full h-12 rounded-full flex items-center justify-center text-skin-muted hover:text-skin-text hover:bg-skin-card border border-skin-border transition-colors font-bold text-sm"
                >
                    <LogOut size={16} className="mr-2" /> Sair para o Lobby
                </button>
            </div>
        </div>
    );
}
