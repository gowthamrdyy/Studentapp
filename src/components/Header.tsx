import { MapPin } from 'lucide-react';

export const Header = () => {
    return (
        <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between shadow-lg z-10">
            <div className="flex items-center gap-3">
                <img
                    src="/srm-logo.png"
                    alt="SRM Logo"
                    className="w-10 h-10 rounded-full shadow-sm bg-white p-0.5 object-contain"
                />
                <div>
                    <h1 className="font-bold text-sm leading-tight">Bus Tracker</h1>
                    <p className="text-[10px] text-blue-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live Tracking
                    </p>
                </div>
            </div>

            <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <MapPin size={18} />
            </button>
        </div>
    );
};
