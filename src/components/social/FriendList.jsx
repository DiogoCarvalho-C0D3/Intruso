import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Trash2, Send, X, Check, Search, Bell } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import Button from '../ui/Button';

export default function FriendList({ isOpen, onClose }) {
    const { currentUser, onlineUsers, addFriend, removeFriend, sendInvite, currentRoom } = useGame();
    const [addName, setAddName] = useState('');
    const [view, setView] = useState('list'); // 'list' or 'add'

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const friends = currentUser?.friends || [];

    // Sort: Online first, then alphabetical
    const sortedFriends = [...friends].sort((a, b) => {
        const aOnline = onlineUsers.some(u => u.id === a.id);
        const bOnline = onlineUsers.some(u => u.id === b.id);
        if (aOnline === bOnline) return a.name.localeCompare(b.name);
        return aOnline ? -1 : 1;
    });

    const isOnline = (id) => onlineUsers.some(u => u.id === id);

    const handleAdd = () => {
        if (addName.trim()) {
            addFriend({ action: 'SEND_REQUEST', targetName: addName });
            setAddName('');
            setView('list');
        }
    };

    const content = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[9998]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                        className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-[9999] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex-none p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                            <div className="flex justify-between items-center mb-1">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Users className="text-violet-400" /> Amigos
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 font-medium pl-9">
                                {onlineUsers.filter(u => friends.some(f => f.id === u.id)).length} Online
                            </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {view === 'list' ? (
                                <>
                                    <button
                                        onClick={() => setView('add')}
                                        className="w-full py-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 font-bold hover:bg-violet-500 hover:text-white transition-all flex items-center justify-center gap-2 group mb-2"
                                    >
                                        <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                                        Adicionar Amigo
                                    </button>

                                    {/* Pending Requests */}
                                    {currentUser?.friendRequests?.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2 flex items-center gap-2">
                                                <Bell size={10} /> Pedidos ({currentUser.friendRequests.length})
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {currentUser.friendRequests.map(req => (
                                                    <div key={req.id} className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between border border-white/5">
                                                        <div>
                                                            <div className="font-bold text-sm text-white">{req.name}</div>
                                                            <div className={`text-[10px] uppercase font-bold tracking-wide ${req.type === 'incoming' ? 'text-blue-400' : 'text-slate-500'}`}>
                                                                {req.type === 'incoming' ? 'Recebido' : 'Enviado'}
                                                            </div>
                                                        </div>
                                                        {req.type === 'incoming' ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => addFriend({ action: 'ACCEPT_REQUEST', requesterId: req.id })}
                                                                    className="w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                                                                    title="Aceitar"
                                                                >
                                                                    <Check size={16} strokeWidth={3} />
                                                                </button>
                                                                <button
                                                                    onClick={() => addFriend({ action: 'DECLINE_REQUEST', requesterId: req.id })}
                                                                    className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                                    title="Recusar"
                                                                >
                                                                    <X size={16} strokeWidth={3} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-500 italic">...</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Friend List */}
                                    <div>
                                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2">
                                            Lista ({sortedFriends.length})
                                        </h3>

                                        {sortedFriends.length === 0 ? (
                                            <div className="text-center text-slate-600 mt-10 p-6 border border-dashed border-white/5 rounded-2xl">
                                                <p className="mb-1">Sozinho no escuro? 🌑</p>
                                                <p className="text-xs">Adiciona amigos para jogarem!</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {sortedFriends.map(friend => {
                                                    const online = isOnline(friend.id);
                                                    return (
                                                        <div key={friend.id} className="group bg-slate-800/30 hover:bg-slate-800 p-3 rounded-xl flex items-center justify-between border border-transparent hover:border-white/5 transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-slate-700 text-slate-300 border border-white/5`}>
                                                                        {friend.name[0].toUpperCase()}
                                                                    </div>
                                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${online ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-200 leading-tight">{friend.name}</div>
                                                                    <div className={`text-[10px] font-bold tracking-wide ${online ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                                        {online ? 'ONLINE' : 'OFFLINE'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                {online && currentRoom && (
                                                                    <button
                                                                        onClick={() => sendInvite(friend.id)}
                                                                        title="Convidar"
                                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-500/10 text-violet-400 hover:bg-violet-500 hover:text-white transition-colors"
                                                                    >
                                                                        <Send size={16} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('Remover amigo?')) removeFriend(friend.id);
                                                                    }}
                                                                    title="Remover"
                                                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-4 animate-fade-in">
                                    <button
                                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2 pl-1"
                                        onClick={() => setView('list')}
                                    >
                                        <div className="p-1 rounded bg-white/5">←</div> Voltar
                                    </button>

                                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Nome do Jogador</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={addName}
                                                onChange={(e) => setAddName(e.target.value)}
                                                placeholder="Ex: C_User123"
                                                className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 rounded-xl pl-10 pr-4 py-3 font-medium text-white placeholder-slate-600 outline-none transition-colors"
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                            />
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        </div>
                                    </div>

                                    <Button onClick={handleAdd} disabled={!addName.trim()}>
                                        <span className="flex items-center gap-2">
                                            <Send size={16} /> Enviar Pedido
                                        </span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
}
