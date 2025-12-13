
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
// import { useStatistics } from '../hooks/useStatistics';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Camera } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Layout from '../components/layout/Layout';
import { compressAvatar } from '../utils/image';

export default function HomeView() {
    const { login, currentUser } = useGame();

    const [authMode, setAuthMode] = useState('LOGIN'); // LOGIN, REGISTER, GUEST
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    // Avatar State
    const [avatarSeed, setAvatarSeed] = useState(Math.random().toString());
    const [avatarImage, setAvatarImage] = useState(null);
    const [avatarType, setAvatarType] = useState('dicebear');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) navigate('/lobby');
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const trimmedName = name.trim();
        if (!trimmedName) return setError('Nome obrigatório.');
        if (trimmedName.length < 2) return setError('Nome muito curto.');

        // PIN Validation for Login/Register
        if (pin.length !== 4) return setError('PIN deve ter 4 dígitos.');
        if (!/^\d+$/.test(pin)) return setError('PIN deve ser numérico.');

        if (authMode === 'REGISTER') {
            if (pin !== confirmPin) return setError('Os PINs não coincidem.');
        }

        setIsLoading(true);
        try {
            await login(authMode, {
                name: trimmedName,
                pin,
                avatarSeed,
                avatarType,
                avatarImage
            });
            navigate('/lobby');
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleGuestEntry = async () => {
        setError('');
        const trimmedName = name.trim();
        if (!trimmedName) return setError('Nome obrigatório.');
        if (trimmedName.length < 2) return setError('Nome muito curto.');

        setIsLoading(true);
        try {
            await login('GUEST', {
                name: trimmedName,
                pin: null, // Guest has no PIN
                avatarSeed,
                avatarType,
                avatarImage
            });
            navigate('/lobby');
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressAvatar(file);
                setAvatarImage(compressed);
                setAvatarType('custom');
            } catch (err) {
                setError("Erro na imagem.");
            }
        }
    };

    const regenAvatar = () => {
        setAvatarSeed(Math.random().toString());
        setAvatarType('dicebear');
        setAvatarImage(null);
    };

    return (
        <Layout className="flex flex-col items-center justify-center min-h-full">
            <div className="w-full max-w-sm flex flex-col items-center justify-center flex-1 py-10 px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-skin-text to-skin-muted mb-2 tracking-tighter">
                        INTRUSO
                    </h1>
                    <p className="text-skin-muted font-medium tracking-wide">Descobre quem mente.</p>
                </motion.div>

                <motion.div
                    className="card w-full shadow-2xl shadow-skin-primary/10 bg-skin-card/80 backdrop-blur overflow-hidden"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    {/* Tabs */}
                    <div className="flex border-b border-skin-border relative">
                        {['LOGIN', 'REGISTER'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => { setAuthMode(mode); setError(''); }}
                                className="relative flex-1 py-4 text-xs font-bold tracking-widest outline-none"
                            >
                                <span className={`relative z-10 transition-colors duration-200 ${authMode === mode ? 'text-skin-primary' : 'text-skin-muted hover:text-skin-text'}`}>
                                    {mode === 'REGISTER' ? 'REGISTAR' : 'ENTRAR'}
                                </span>

                                {authMode === mode && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-skin-primary"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}

                                {authMode === mode && (
                                    <motion.div
                                        layoutId="activeTabBg"
                                        className="absolute inset-0 bg-gradient-to-t from-skin-primary/10 to-transparent"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}

                                {/* Hover Effect for all tabs */}
                                <div className="absolute inset-0 bg-skin-base opacity-0 hover:opacity-10 transition-opacity duration-300" />
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col items-center p-6 gap-6">

                        {/* Avatar */}
                        <div className="relative group">
                            <Avatar
                                name={name || '?'}
                                seed={avatarSeed}
                                image={avatarType === 'custom' ? avatarImage : null}
                                size="lg"
                                className="border-4 border-skin-border group-hover:border-skin-primary transition-colors"
                            />
                            <div onClick={regenAvatar} className="absolute -bottom-1 -right-1 bg-skin-primary text-white p-1.5 rounded-full cursor-pointer hover:rotate-180 transition-transform shadow-lg">
                                <RefreshCw size={14} />
                            </div>
                            <label className="absolute -bottom-1 -left-1 bg-skin-secondary text-white p-1.5 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                                <Camera size={14} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                        </div>

                        {/* Inputs */}
                        <div className="w-full space-y-3">
                            {authMode === 'REGISTER' ? (
                                <>
                                    {/* Register Layout: Name (Row 1), PINs (Row 2 Col 2) */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-skin-muted ml-1">
                                            Nome
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase())}
                                            placeholder="NOME"
                                            className="input input-bordered w-full bg-skin-base border-skin-border text-skin-text font-bold text-center uppercase tracking-widest focus:ring-skin-primary px-0"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-skin-muted ml-1">PIN</label>
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                placeholder="****"
                                                className="input input-bordered w-full bg-skin-base border-skin-border text-skin-text font-mono text-center text-xl tracking-[0.5em] focus:ring-skin-primary px-0"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-skin-muted ml-1">Confirmar</label>
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                value={confirmPin}
                                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                placeholder="****"
                                                className="input input-bordered w-full bg-skin-base border-skin-border text-skin-text font-mono text-center text-xl tracking-[0.5em] focus:ring-skin-primary px-0"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Login Layout: Grid 2 Cols (Name | PIN) */
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-skin-muted ml-1">
                                            Nome
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase())}
                                            placeholder="NOME"
                                            className="input input-bordered w-full bg-skin-base border-skin-border text-skin-text font-bold text-center uppercase tracking-widest focus:ring-skin-primary px-0"
                                        />
                                    </div>

                                    <div className="space-y-1 animate-fade-in">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-skin-muted ml-1">PIN</label>
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            placeholder="****"
                                            className="input input-bordered w-full bg-skin-base border-skin-border text-skin-text font-mono text-center text-xl tracking-[0.5em] focus:ring-skin-primary px-0"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="text-xs text-red-500 font-bold bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 w-full text-center">
                                {error}
                            </div>
                        )}

                        <div className="w-full space-y-3">
                            {authMode === 'LOGIN' ? (
                                <>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn btn-primary w-full shadow-lg shadow-skin-primary/20 font-bold h-12 text-lg"
                                    >
                                        {isLoading ? 'A Processar...' : 'IDENTIFICAR'}
                                    </button>

                                    <div className="relative flex py-1 items-center">
                                        <div className="flex-grow border-t border-skin-border"></div>
                                        <span className="flex-shrink mx-2 text-[10px] text-skin-muted uppercase tracking-widest">OU</span>
                                        <div className="flex-grow border-t border-skin-border"></div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGuestEntry}
                                        disabled={isLoading}
                                        className="btn btn-ghost border-2 border-skin-border w-full font-bold text-xs tracking-widest hover:border-skin-primary hover:bg-skin-primary/5"
                                    >
                                        ENTRAR COMO CONVIDADO
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn btn-primary w-full shadow-lg shadow-skin-primary/20 font-bold h-12 text-lg"
                                >
                                    {isLoading ? 'A Processar...' : 'CRIAR IDENTIDADE'}
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
        </Layout>
    );
}

