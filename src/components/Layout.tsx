import { Sidebar } from "./Sidebar";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background text-white font-sans selection:bg-accent-cyan/30">
            <div className="absolute inset-0 bg-[url('/bg-grid.svg')] opacity-5 pointer-events-none" />
            <Sidebar />
            <main className="flex-1 relative overflow-auto p-8">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
                {children}
            </main>
            <QRCodeDisplay />
        </div>
    );
}
