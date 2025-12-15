import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';

export default function NotificationToast({ notifications, removeNotification }) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className="pointer-events-auto bg-skin-card border border-skin-border shadow-2xl rounded-xl p-4 min-w-[300px] flex flex-col gap-2 backdrop-blur-md"
                    >
                        <div className="flex items-start justify-between">
                            <h4 className="font-bold text-sm text-skin-primary uppercase tracking-wider">
                                {notif.type === 'invite' ? 'Convite 💌' : 'Notificação 🔔'}
                            </h4>
                            <button
                                onClick={() => removeNotification(notif.id)}
                                className="text-skin-muted hover:text-skin-text"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-skin-text font-medium text-lg">
                            {notif.message}
                        </p>

                        {notif.action && (
                            <button
                                onClick={() => {
                                    notif.action.callback();
                                    removeNotification(notif.id);
                                }}
                                className="mt-2 bg-skin-primary text-white py-2 px-4 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                {notif.action.label}
                            </button>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
