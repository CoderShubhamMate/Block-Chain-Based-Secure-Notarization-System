import React from 'react';

/**
 * 🦴 [SKELETON] SkeletonJourney Component
 * Purpose: Layout-perfect placeholder for the JourneyBox during BOOTSTRAP/LOADING.
 * Uses "Calm Pulses" instead of moving gradients to minimize CPU impact.
 */
const SkeletonJourney: React.FC = () => {
  return (
    <div className="p-6 bg-[#0B0F1A] border border-blue-500/20 rounded-xl shadow-2xl relative overflow-hidden animate-pulse">
      {/* Narrative Anchor */}
      <div className="absolute top-4 right-4 text-[10px] text-blue-400/40 font-mono uppercase tracking-widest">
        Syncing Reality...
      </div>

      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-blue-500/10 rounded" />
            <div className="h-3 w-48 bg-blue-500/5 rounded" />
          </div>
        </div>

        {/* Status Area Skeleton */}
        <div className="p-4 bg-black/40 border border-white/5 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-blue-400/20 rounded" />
            <div className="h-4 w-16 bg-blue-400/10 rounded" />
          </div>
          <div className="w-full h-2 bg-blue-900/30 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-blue-500/20 rounded-full animate-progress-shimmer" />
          </div>
          <div className="h-3 w-full bg-white/5 rounded" />
        </div>

        {/* Step Indicator Skeleton */}
        <div className="flex justify-between items-center px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20" />
              <div className="h-2 w-8 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Footer Text */}
        <div className="text-center pt-2">
          <p className="text-xs text-blue-400/40 italic font-medium animate-pulse">
            Preparing your secure workspace...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes progress-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-progress-shimmer {
          animation: progress-shimmer 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SkeletonJourney;
