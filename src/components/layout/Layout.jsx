
import { motion } from 'framer-motion';
import Snowfall from '../ui/Snowfall';
import ChristmasDecorations from '../ui/ChristmasDecorations';

export default function Layout({
    header,
    footer,
    children,
    className = "",
    noPadding = false
}) {
    return (
        <div className="fixed inset-0 bg-skin-base flex flex-col overflow-hidden text-skin-text">
            <Snowfall />
            <ChristmasDecorations />
            {/* Safe Area Top Background */}
            <div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-skin-base z-50" />

            {/* Content Container */}
            <div className="flex-1 flex flex-col w-full max-w-lg mx-auto bg-skin-base h-full relative shadow-2xl z-10">

                {/* Header */}
                {header && (
                    <header className="flex-none h-[60px] px-4 flex items-center justify-between border-b border-skin-border bg-skin-base z-40 relative">
                        {header}
                    </header>
                )}

                {/* Main Content */}
                <main className={`flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth ${noPadding ? '' : 'p-4'} ${className}`}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </main>

                {/* Footer */}
                {footer && (
                    <footer className="flex-none p-4 pt-4 bg-skin-base border-t border-skin-border z-40 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        {footer}
                    </footer>
                )}

                {/* Version Watermark */}
                <div className="absolute bottom-1 right-2 z-50 pointer-events-none opacity-20 text-[10px] font-mono text-skin-muted">
                    v1.2.0-xmas
                </div>
            </div>
        </div>
    );
}
