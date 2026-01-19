import { useStore } from '../store';
import { DriverCard } from './DriverCard';
import { Card } from './Card';
import { Terminal } from 'lucide-react';

export function DriverHub() {
    const { drivers } = useStore();

    return (
        <Card className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Terminal className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-white">Driver Integration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2">
                {drivers.map((driver) => (
                    <DriverCard key={driver.name} driver={driver} />
                ))}
            </div>
        </Card>
    );
}
