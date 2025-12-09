
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, X } from 'lucide-react';
import Button from '../ui/Button';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);

    useEffect(() => {
        // Check local storage for cooldown
        const dismissedAt = localStorage.getItem('pwa_prompt_dismissed_v2');
        if (dismissedAt) {
            const hoursSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
            if (hoursSince < 24) return;
        }

        // Android / Desktop detection
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowAndroidPrompt(true);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // iOS Detection
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

        if (isIOS && !isStandalone) {
            // Wait a bit before showing
            const timer = setTimeout(() => setShowIOSPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleDismiss = () => {
        setShowIOSPrompt(false);
        setShowAndroidPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed_v2', Date.now().toString());
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowAndroidPrompt(false);
        }
    };

    return (
        <AnimatePresence>
            {/* iOS Prompt */}
            {showIOSPrompt && (
                <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 pointer-events-auto"
                        onClick={handleDismiss}
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="relative w-full max-w-md bg-slate-900 border-t border-slate-700 p-6 pb-12 rounded-t-2xl shadow-2xl pointer-events-auto"
                    >
                        <button onClick={handleDismiss} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                I
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Instalar Intruso</h3>
                                <p className="text-slate-400 text-sm">Para uma melhor experiência</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm text-slate-300">
                            <p>Instala a aplicação no teu iPhone para jogares em ecrã inteiro:</p>
                            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                                <span className="flex items-center justify-center w-8 h-8 bg-slate-700 rounded-full font-bold">1</span>
                                <span>Toca no botão <Share className="inline mx-1 text-blue-400" size={16} /> <strong>Partilhar</strong></span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                                <span className="flex items-center justify-center w-8 h-8 bg-slate-700 rounded-full font-bold">2</span>
                                <span>Escolhe <PlusSquare className="inline mx-1" size={16} /> <strong>Ecrã Principal</strong></span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Android / Desktop Prompt */}
            {showAndroidPrompt && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                                    I
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Instalar App</h3>
                                    <p className="text-xs text-slate-400">Acesso rápido e ecrã inteiro</p>
                                </div>
                            </div>
                            <button onClick={handleDismiss} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <Button onClick={handleInstallClick} className="btn-primary py-2 text-sm">
                            Instalar Agora
                        </Button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
