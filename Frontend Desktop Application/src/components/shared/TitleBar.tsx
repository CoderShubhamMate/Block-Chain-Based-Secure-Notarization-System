import React from 'react';
import { Shield, ShieldAlert, WifiOff, RefreshCw, LogOut, Info, Minus, Square, X } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigAuthority';

interface TitleBarProps {
  user: any;
  onRetry?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ user, onRetry }) => {
  const { mode } = useConfig();
  
  const getStatusConfig = () => {
    if (user?.zeroTrustStatus === 'DEGRADED') {
      return {
        label: 'RESILIENCE ACTIVE',
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
        border: 'border-amber-400/20',
        icon: <WifiOff size={14} />,
        description: 'Limited blockchain confirmation. Running in degraded mode.'
      };
    }
    
    if (user?.zeroTrustStatus === 'UNKNOWN') {
      return {
        label: 'SECURITY UNCERTAIN',
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/20',
        icon: <ShieldAlert size={14} />,
        description: 'Session integrity verification failed. Manual handshake required.'
      };
    }

    if (mode === 'STALE') {
      return {
        label: 'CONFIG STALE',
        color: 'text-orange-400',
        bg: 'bg-orange-400/10',
        border: 'border-orange-400/20',
        icon: <Info size={14} />,
        description: 'Configuration outdated. Write operations may be restricted.'
      };
    }

    if (mode === 'EMERGENCY') {
      return {
        label: 'EMERGENCY MODE',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        icon: <ShieldAlert size={14} />,
        description: 'CRITICAL: Authority sync failed. System isolation active.'
      };
    }

    return {
      label: 'SYSTEM VERIFIED',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      icon: <Shield size={14} />,
      description: 'Zero-trust handshake verified. All protocols nominal.'
    };
  };

  const status = getStatusConfig();

  const handleMinimize = () => (window as any).electronAPI.window.minimize();
  const handleMaximize = () => (window as any).electronAPI.window.maximize();
  const handleClose = () => (window as any).electronAPI.window.close();

  return (
    <div 
      className="h-8 bg-black border-b border-white/5 flex items-center justify-between px-4 select-none"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <Shield size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black tracking-[0.2em] text-white/80 italic truncate">BBSNS CONSOLE</span>
        </div>
        
        <div 
          className={`flex items-center gap-2 px-2 py-0.5 rounded-md border ${status.bg} ${status.border} ${status.color} transition-all duration-500 shrink-0 ml-2 flex items-center`}
          title={status.description}
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          {status.icon}
          <span className="text-[9px] font-black uppercase tracking-tighter">{status.label}</span>
          
          {/* 🔄 [ACTION] Authority Re-Sync Symbol */}
          {(mode !== 'LIVE' || user?.zeroTrustStatus === 'DEGRADED' || user?.zeroTrustStatus === 'UNKNOWN') && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRetry?.();
              }}
              className={`ml-1.5 p-0.5 hover:bg-white/10 rounded transition-all active:scale-75 cursor-pointer ${status.color}`}
              title="Initiate Authority Re-Handshake"
            >
              <RefreshCw size={10} className={mode === 'EMERGENCY' ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center h-full relative z-50" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* Window Controls */}
        <div className="flex items-center h-full border-l border-white/5 ml-2 pointer-events-auto">
          <button 
            onClick={handleMinimize}
            className="w-10 h-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={handleMaximize}
            className="w-10 h-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <Square size={12} />
          </button>
          <button 
            onClick={handleClose}
            className="w-12 h-full flex items-center justify-center text-white/40 hover:bg-red-500/90 hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
