import { Sidebar } from "./Sidebar";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background text-white font-sans selection:bg-accent-cyan/30 relative">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 bg-[url('/bg-grid.svg')] opacity-10 pointer-events-none" />
            
            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden mix-blend-overlay opacity-50">
                <div className="w-full h-full animate-scanline" />
            </div>

            <Sidebar />
            
            <main className="flex-1 relative overflow-hidden flex flex-col p-6 pl-0">
                {children}
            </main>
            
            <QRCodeDisplay />
        </div>
    );
}
