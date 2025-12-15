import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import RevealPhase from '../components/game/RevealPhase';
import RoundPhase from '../components/game/RoundPhase';
import VotingPhase from '../components/game/VotingPhase';
import ResultPhase from '../components/game/ResultPhase';
import Layout from '../components/layout/Layout';
import { Settings, Eye, Trash2, X, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function GameView() {
    const { roomId } = useParams();
    const { currentRoom, currentUser, updateRoomState, sendPlayerReady, sendHostAction } = useGame();
    const navigate = useNavigate();
    const [showHostControls, setShowHostControls] = useState(false);
    const [showRoleCheck, setShowRoleCheck] = useState(false);

    // CRITICAL: Prevent render crash if user is not logged in.
    // Moved to after effects to strictly follow Rules of Hooks.

    useEffect(() => {
        let timeout;
        if (!currentRoom) {
            // Redirect to Lobby if logged in, otherwise Home
            // Add a small delay/timeout to FORCE redirect if it doesn't happen instantly
            // This catches the 'white screen' case where rendering stops but navigation didn't trigger
            timeout = setTimeout(() => {
                navigate(currentUser ? '/lobby' : '/');
            }, 100);
        } else if (currentRoom.status === 'LOBBY') {
            navigate(`/room/${currentRoom.id}`);
        } else if (currentRoom.status === 'ABORTED') {
            // Room was deleted/aborted by host
            navigate('/lobby');
        }
        return () => clearTimeout(timeout);
    }, [currentRoom, navigate, currentUser]);

    // --- HOST WATCHDOG FOR VOTING ---
    // If everyone has voted but state hasn't advanced, force calculation.
    useEffect(() => {
        if (
            currentRoom?.hostId === currentUser?.id &&
            currentRoom?.gameState?.phase === 'VOTE' &&
            currentRoom?.gameState?.votes
        ) {
            const voteCount = Object.keys(currentRoom.gameState.votes).length;
            const playerCount = currentRoom.players.length;

            if (voteCount >= playerCount) {
                // If everyone voted but we are still in VOTE, wait a moment then force update
                // This acts as a fallback for the main handleVote logic if it missed the trigger
                const timer = setTimeout(() => {
                    // Trigger a "phantom" vote update to force re-evaluation or call calculation logic directly
                    // Here we re-run the calculation logic essentially
                    handleVote(currentRoom.gameState.votes[currentUser.id]);
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentRoom, currentUser]);


    // Handle abrupt deletion or missing state
    if (!currentRoom || !currentRoom.gameState) {
        return (
            <Layout className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 animate-fade-in text-center p-8">
                    <span className="text-skin-muted animate-pulse mb-4">A sincronizar estado...</span>

                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl max-w-xs">
                        <p className="text-orange-500 text-sm font-bold mb-2">Algo correu mal?</p>
                        <p className="text-skin-muted text-xs mb-4">Se a sala foi apagada ou a ligação falhou, volta ao lobby.</p>
                        <button
                            onClick={() => navigate('/lobby')}
                            className="btn bg-skin-card hover:bg-skin-base border border-skin-border text-skin-text w-full py-2 rounded-lg text-sm font-bold"
                        >
                            <Trash2 size={16} className="inline mr-2" />
                            Sair para o Lobby
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // CRITICAL: Prevent render crash if user is not logged in.
    if (!currentUser) return null;

    const gameState = currentRoom.gameState;
    const isHost = currentRoom.hostId === currentUser?.id;

    // --- Handlers ---

    const handleRevealReady = () => {
        sendPlayerReady();
    };

    const handleNextTurn = () => {
        let nextIndex = gameState.currentTurnIndex + 1;
        let nextRound = gameState.round;
        let nextPhase = gameState.phase;

        if (nextIndex >= currentRoom.players.length) {
            nextIndex = 0;
            nextRound++;
            if (nextRound > gameState.totalRounds) {
                nextPhase = 'VOTE';
            }
        }

        updateRoomState(currentRoom.id, {
            gameState: {
                ...gameState,
                currentTurnIndex: nextIndex,
                round: nextRound,
                phase: nextPhase
            }
        });
    };

    const handleVote = (targetId) => {
        const newVotes = { ...gameState.votes, [currentUser.id]: targetId };
        const updates = { votes: newVotes };

        // Determine required votes
        const impostorIds = gameState.impostorIds || [];
        const totalPlayers = currentRoom.players.length;
        // In Runoff, Impostors don't vote, so threshold is lower
        const requiredVotes = gameState.isRunoff ? (totalPlayers - impostorIds.length) : totalPlayers;

        // Check if everyone (who needs to) has voted
        if (Object.keys(newVotes).length >= requiredVotes) {
            // Calculate Results Logic

            // 1. Tally votes (EXCLUDING Impostors)
            const voteCounts = {};
            Object.entries(newVotes).forEach(([voterId, votedId]) => {
                // Impostor votes do not count visually for decision
                if (!impostorIds.includes(voterId)) {
                    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
                }
            });

            // 2. Find max votes
            let maxVotes = 0;
            let mostVotedIds = [];
            Object.entries(voteCounts).forEach(([id, count]) => {
                if (count > maxVotes) {
                    maxVotes = count;
                    mostVotedIds = [id];
                } else if (count === maxVotes) {
                    mostVotedIds.push(id);
                }
            });

            // 3. Check for Tie
            if (mostVotedIds.length > 1 && !gameState.isRunoff) {
                // TRIGGER RUNOFF
                updates.isRunoff = true;
                updates.runoffCandidates = mostVotedIds;
                updates.votes = {}; // Reset votes for runoff
                // Do not change phase, stay in VOTE
            } else {
                // DECISION MADE (Or tie persisted, in which case we just reveal results)
                updates.phase = 'RESULT';
            }
        }

        updateRoomState(currentRoom.id, {
            gameState: { ...gameState, ...updates }
        });
    };

    const handleRestart = () => {
        if (isHost) {
            sendHostAction('RESTART');
            setShowHostControls(false);
        }
    };

    const handleDelete = () => {
        if (isHost) {
            if (confirm('Tens a certeza? A sala será apagada para todos.')) {
                sendHostAction('DELETE');
            }
        }
    };

    // Render Phase
    const renderPhase = () => {
        switch (gameState.phase) {
            case 'REVEAL':
                return <RevealPhase gameState={gameState} onReady={handleRevealReady} />;
            case 'ROUND':
                return <RoundPhase gameState={gameState} onNextTurn={handleNextTurn} />;
            case 'VOTE':
                return <VotingPhase gameState={gameState} onVote={handleVote} />;
            case 'RESULT':
                return <ResultPhase gameState={gameState} onRestart={handleRestart} />;
            default:
                return <div>Estado desconhecido: {gameState.phase}</div>;
        }
    };

    const header = (
        <div className="w-full flex items-center justify-between">
            {/* Left: Role Check */}
            <button
                onClick={() => setShowRoleCheck(true)}
                className="w-10 h-10 rounded-full bg-skin-card flex items-center justify-center text-skin-muted hover:text-skin-text hover:bg-skin-base transition-colors"
                title="Ver minha função"
            >
                <Eye size={20} />
            </button>

            {/* Right: Host Controls */}
            {isHost ? (
                <button
                    onClick={() => setShowHostControls(true)}
                    className="w-10 h-10 rounded-full bg-skin-card flex items-center justify-center text-skin-muted hover:text-skin-text hover:bg-skin-base transition-colors"
                    title="Admin"
                >
                    <Settings size={20} />
                </button>
            ) : <div className="w-10" />}
        </div>
    );

    const isImpostor = gameState.impostorIds.includes(currentUser.id);

    return (
        <Layout header={header}>
            {/* Host Controls Modal - PORTAL to body */}
            {createPortal(
                <AnimatePresence>
                    {showHostControls && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowHostControls(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative z-10 w-full max-w-sm p-4"
                            >
                                <div className="bg-skin-card border border-skin-border rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[85vh] overflow-y-auto">
                                    <button
                                        onClick={() => setShowHostControls(false)}
                                        className="absolute top-4 right-4 text-skin-muted hover:text-skin-text transition-colors"
                                    >
                                        <X size={24} />
                                    </button>

                                    <h3 className="text-xl font-black text-skin-text mb-8 text-center tracking-tight">ADMINISTRAÇÃO</h3>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={() => { handleRestart(); setShowHostControls(false); }}
                                            className="btn bg-skin-primary hover:bg-skin-primary-hover text-white w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-skin-primary/20"
                                        >
                                            <RefreshCw size={20} /> Reiniciar Jogo
                                        </button>

                                        <button
                                            onClick={() => { handleDelete(); setShowHostControls(false); }}
                                            className="btn bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3"
                                        >
                                            <Trash2 size={20} /> Apagar Sala
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Role Check Modal - PORTAL to body */}
            {createPortal(
                <AnimatePresence>
                    {showRoleCheck && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                onClick={() => setShowRoleCheck(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative z-10 w-full max-w-xs pointer-events-none"
                            >
                                <div className="bg-skin-card border border-skin-border rounded-3xl p-8 shadow-2xl relative pointer-events-auto text-center">
                                    <button
                                        onClick={() => setShowRoleCheck(false)}
                                        className="absolute top-4 right-4 text-skin-muted hover:text-skin-text transition-colors"
                                    >
                                        <X size={24} />
                                    </button>

                                    <h3 className="text-sm font-bold uppercase tracking-widest text-skin-muted mb-6">A tua função</h3>

                                    {isImpostor ? (
                                        <>
                                            <div className="text-red-500 font-black text-4xl tracking-tighter drop-shadow-2xl mb-4">INTRUSO</div>
                                            <p className="text-skin-muted text-sm">Mistura-te e descobre a palavra!</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-skin-text font-black text-3xl uppercase mb-4 break-words">{gameState.secretWord}</div>
                                            <p className="text-skin-muted text-sm">Esta é a palavra secreta.</p>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {renderPhase()}
        </Layout>
    );
}
