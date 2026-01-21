import clsx from 'clsx';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    title?: string;
}

export default function GlassCard({ children, className, title }: GlassCardProps) {
    return (
        <div className={clsx(
            "backdrop-blur-3xl bg-black/40 border border-transparent",
            "border-t-white/20 border-l-white/20 border-b-black/50 border-r-black/50",
            "shadow-2xl rounded-2xl flex flex-col relative",
            className
        )}>
            {title && (
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-white/60">{title}</h3>
                </div>
            )}
            <div className="p-5 flex-1 relative z-10">
                {children}
            </div>
        </div>
    );
}
