import React from 'react';
import { X, Check, Keyboard, Lightbulb, Star, ShieldAlert } from 'lucide-react';
import { SoundEngine } from '../utils/audio';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1c1f26] border border-zinc-700/60 rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/SEEMA_Parking_Puzzle_Icon__1__2505aaee.png"
              alt="Seema Logo"
              className="w-12 h-12 object-contain rounded-xl shadow-md border border-amber-400/30"
            />
            <div>
              <h2 className="font-heading text-3xl font-black text-white uppercase tracking-wide leading-none">
                SEEMA
              </h2>
              <p className="text-xs text-zinc-400">Rules & Strategy Guide</p>
            </div>
          </div>

          <button
            onClick={() => {
              SoundEngine.click();
              onClose();
            }}
            aria-label="Close Rules"
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="flex flex-col gap-4 py-4 text-xs text-zinc-300">
          {/* Objective */}
          <div className="flex gap-3 items-start bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <span className="font-heading font-black text-base">GT</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Clear the Exit Lane</h3>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                The <strong className="text-red-400 font-semibold">Red GT Car</strong> is trapped in a congested 6×6 parking grid. Slide surrounding cars and trucks out of the way to drive it through the right-hand exit.
              </p>
            </div>
          </div>

          {/* Movement Mechanics */}
          <div className="flex gap-3 items-start bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Movement Constraints</h3>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                • <strong>Horizontal vehicles</strong> can only slide <strong className="text-sky-300">Left & Right</strong>.<br />
                • <strong>Vertical vehicles</strong> can only slide <strong className="text-sky-300">Up & Down</strong>.<br />
                • Vehicles cannot turn, rotate, or jump over other vehicles.
              </p>
            </div>
          </div>

          {/* Star Rating Criteria */}
          <div className="flex gap-3 items-start bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Star Ratings & Par</h3>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                • <strong className="text-amber-300">3 Stars (★★★)</strong>: Solve in optimal par moves.<br />
                • <strong className="text-amber-300">2 Stars (★★☆)</strong>: Solve within 3 extra moves.<br />
                • <strong className="text-amber-300">1 Star (★☆☆)</strong>: Successfully parked!
              </p>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="flex gap-3 items-start bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Keyboard className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 gap-1.5 mt-1 font-mono text-[11px]">
                <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-white">Arrow/WASD</span> Slide car</div>
                <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-white">Space / Tab</span> Select car</div>
                <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-white">U</span> Undo move</div>
                <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-white">R</span> Restart level</div>
                <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-white">H</span> Next hint</div>
                <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-white">Esc</span> Close modal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Got It Button */}
        <button
          onClick={() => {
            SoundEngine.click();
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-heading text-lg font-bold uppercase tracking-wider transition-colors mt-2"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
