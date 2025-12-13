
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Check, Camera } from 'lucide-react';
import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import { compressAvatar } from '../../utils/image';

const THEMES = [
    { id: 'theme-slate', name: 'Ardósia', bg: 'bg-slate-950' },
    { id: 'theme-midnight', name: 'Meia-Noite', bg: 'bg-[#050a1e]' }, // hardcoded preview color
    { id: 'theme-paper', name: 'Papiro', bg: 'bg-stone-100' },
    { id: 'theme-soft', name: 'Algodão', bg: 'bg-[#fff1f2]' },
    { id: 'theme-christmas', name: 'Natal', bg: 'bg-[#160a0a]' }
];

export default function SettingsModal({ isOpen, onClose, user, onSave }) {
    const [name, setName] = useState('');
    const [avatarSeed, setAvatarSeed] = useState('');
    const [avatarImage, setAvatarImage] = useState(null);
    const [avatarType, setAvatarType] = useState('dicebear');
    const [theme, setTheme] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            setName(user.name);
            setAvatarSeed(user.avatarSeed || user.name);
            setAvatarImage(user.avatarImage || null);
            setAvatarType(user.avatarType || 'dicebear');
            setTheme(user.theme || 'theme-slate');
        }
    }, [isOpen, user]);

    const handleSave = () => {
        onSave({ name, avatarSeed, theme, avatarImage, avatarType });
        onClose();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressAvatar(file);
                setAvatarImage(compressed);
                setAvatarType('custom');
            } catch (err) {
                console.error("Compression failed", err);
                setError("Erro ao carregar imagem.");
            }
        }
    };

    const regenAvatar = () => {
        setAvatarSeed(Math.random().toString());
        setAvatarType('dicebear');
        setAvatarImage(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-sm bg-skin-card border border-skin-border rounded-3xl p-6 shadow-2xl z-10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-skin-base flex items-center justify-center text-skin-muted hover:text-skin-text transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="text-xl font-bold mb-6 text-skin-text flex items-center gap-2">
                            Definições
                        </h2>

                        <div className="space-y-6">
                            {/* Avatar & Name */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <Avatar
                                        name={name}
                                        seed={avatarSeed}
                                        image={avatarType === 'custom' ? avatarImage : null}
                                        size="xl"
                                        className="shadow-xl border-4 border-skin-border transition-colors"
                                    />

                                    {/* Refresh Button */}
                                    <div
                                        onClick={regenAvatar}
                                        className="absolute -bottom-2 -right-2 bg-skin-primary text-white p-2 rounded-full shadow-lg cursor-pointer hover:rotate-180 transition-transform z-10"
                                        title="Gerar Aleatório"
                                    >
                                        <RefreshCw size={16} />
                                    </div>

                                    {/* Upload Button */}
                                    <label className="absolute -bottom-2 -left-2 bg-skin-secondary text-white p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform z-10" title="Carregar Foto">
                                        <Camera size={16} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>

                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={15}
                                    className="input text-center font-bold"
                                    placeholder="Nome"
                                />
                            </div>

                            {/* Theme Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-skin-muted ml-1">Tema</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {THEMES.map(t => {
                                        const isSelected = theme === t.id;
                                        return (
                                            <div key={t.id} className="flex flex-col items-center gap-1">
                                                <button
                                                    onClick={() => setTheme(t.id)}
                                                    className={`w-full aspect-square rounded-xl border-2 transition-all active:scale-95 flex items-center justify-center relative overflow-hidden ${isSelected ? 'border-skin-primary ring-2 ring-skin-primary/30' : 'border-skin-border hover:border-skin-muted'}`}
                                                >
                                                    <div className={`absolute inset-0 ${t.bg}`} />
                                                    {isSelected && (
                                                        <div className="bg-skin-primary text-white rounded-full p-0.5 z-10 shadow-lg">
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </button>
                                                <span className={`text-[10px] font-bold uppercase truncate w-full text-center ${isSelected ? 'text-skin-primary' : 'text-skin-muted'}`}>
                                                    {t.name}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <button onClick={handleSave} className="btn btn-primary w-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                Guardar Alterações
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
