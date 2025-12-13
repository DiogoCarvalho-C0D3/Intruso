import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ArrowLeft, Sparkles, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { CHANGELOG, APP_VERSION } from '../data/changelog';

export default function ChangelogView() {
    const navigate = useNavigate();

    const header = (
        <div className="flex items-center gap-4 w-full h-full">
            <button
                onClick={() => navigate('/')}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <ArrowLeft size={24} className="text-skin-text" />
            </button>
            <div className="flex-1">
                <h1 className="text-xl font-black text-skin-text uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-400" />
                    Novidades
                </h1>
            </div>
        </div>
    );

    return (
        <Layout className="bg-skin-base flex flex-col h-full" header={header}>

            <div className="p-6 space-y-10 pb-20">
                {CHANGELOG.map((release, index) => {
                    const isLatest = release.version === APP_VERSION;

                    return (
                        <motion.div
                            key={release.version}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative pl-8 border-l-2 ${isLatest ? 'border-skin-primary' : 'border-skin-border'}`}
                        >
                            {/* Dot indicator */}
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-skin-base ${isLatest ? 'bg-skin-primary' : 'bg-skin-border'}`} />

                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-2xl font-black tracking-tighter ${isLatest ? 'text-skin-primary' : 'text-skin-text'}`}>
                                    v{release.version}
                                </span>
                                {isLatest && (
                                    <span className="bg-skin-primary/20 text-skin-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        Atual
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-skin-muted mb-4 font-mono uppercase tracking-wide">
                                <Calendar size={12} />
                                {release.date}
                            </div>

                            <h3 className="text-lg font-bold text-skin-text mb-3 flex items-center gap-2">
                                {release.title}
                            </h3>

                            <ul className="space-y-3">
                                {release.features.map((feature, i) => (
                                    <li key={i} className="text-sm text-skin-muted flex items-start gap-2 leading-relaxed">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-skin-border flex-none" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    );
                })}


                <div className="text-center pt-10 text-xs text-skin-muted opacity-50 font-mono">
                    Intruso Dev Team © 2025
                </div>
            </div>
        </Layout>
    );
}
