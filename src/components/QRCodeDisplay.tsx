import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { invoke } from '@tauri-apps/api/core';
import { Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QRCodeDisplay() {
    const [ip, setIp] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        invoke<string>('get_local_ip').then(setIp).catch(console.error);
    }, []);

    const connectionString = `ws://${ip}:8080`;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 p-3 bg-black/60 border border-gray-700 rounded-full hover:border-accent-cyan hover:shadow-[0_0_15px_rgba(0,242,255,0.3)] transition-all z-40 group"
                title="Connect iPad Remote"
            >
                <Smartphone className="w-5 h-5 text-gray-400 group-hover:text-accent-cyan" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-black/80 border border-accent-cyan/50 p-8 rounded-2xl flex flex-col items-center shadow-[0_0_50px_rgba(0,242,255,0.2)]"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-2 tracking-widest">REMOTE LINK</h2>
                            <p className="text-gray-400 mb-6 text-sm">Scan to connect iPad Console</p>

                            <div className="bg-white p-4 rounded-xl">
                                <QRCodeSVG value={connectionString} size={200} />
                            </div>

                            <div className="mt-6 font-mono text-accent-cyan bg-accent-cyan/10 px-4 py-2 rounded border border-accent-cyan/20">
                                {connectionString}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
