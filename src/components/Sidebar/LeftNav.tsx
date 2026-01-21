import { Activity, LayoutGrid, Settings, Cpu, Database } from 'lucide-react';
import clsx from 'clsx';

const NavItem = ({ icon: Icon, active = false }: { icon: any, active?: boolean }) => (
    <div className={clsx(
        "w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-all duration-300 cursor-pointer",
        active
            ? "bg-aether-cyan/10 text-aether-cyan border border-aether-cyan/50 shadow-[0_0_15px_rgba(0,242,255,0.3)]"
            : "text-white/20 hover:text-white/60 hover:bg-white/5"
    )}>
        <Icon size={24} />
    </div>
);

export default function LeftNav() {
    return (
        <nav className="w-[72px] bg-black/80 border-r border-white/5 flex flex-col items-center py-6 backdrop-blur-xl z-50 h-full flex-shrink-0">
            {/* Brand Icon or top spacer */}
            <div className="mb-10 text-aether-cyan opacity-80">
                <Cpu size={28} />
            </div>

            <NavItem icon={LayoutGrid} active /> {/* Topology Map */}
            <NavItem icon={Activity} />
            <NavItem icon={Database} />

            <div className="flex-1" />

            <NavItem icon={Settings} />
        </nav>
    );
}
