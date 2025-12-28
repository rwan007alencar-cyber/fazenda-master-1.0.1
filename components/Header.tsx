
import React from 'react';
import { GameState } from '../types';
import { XP_PER_LEVEL } from '../constants';

interface HeaderProps {
  state: GameState;
  onOpenFinancialHistory: () => void;
  onOpenWarehouse: () => void;
}

const Header: React.FC<HeaderProps> = ({ state, onOpenFinancialHistory, onOpenWarehouse }) => {
  const xpProgress = (state.xp / (state.level * XP_PER_LEVEL)) * 100;
  
  const totalInSilo = (Object.values(state.inventory) as number[]).reduce((acc, curr) => acc + curr, 0);
  const totalInSeeds = (Object.values(state.seedInventory) as number[]).reduce((acc, curr) => acc + curr, 0);

  return (
    <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {state.level}
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Nível</div>
            <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <button 
          onClick={onOpenFinancialHistory}
          className="flex items-center gap-3 px-4 py-2 bg-stone-50 rounded-2xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50 transition-all group"
        >
          <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
             <i className="fas fa-wallet text-sm"></i>
          </div>
          <div className="text-left">
            <div className="text-[8px] font-black text-stone-400 uppercase tracking-widest leading-none mb-0.5">Saldo Atual</div>
            <div className="text-amber-600 font-black text-lg leading-none">
              R$ {state.money.toLocaleString('pt-BR')}
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenWarehouse}
          className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-xl border border-stone-100 text-stone-400 group hover:border-blue-300 hover:bg-blue-50 transition-all relative"
        >
          <i className="fas fa-boxes-stacked text-sm group-hover:text-blue-500 transition-colors"></i>
          <span className="text-[10px] font-black uppercase tracking-tighter">Estoque</span>
          {(totalInSilo + totalInSeeds) > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-stone-800 text-white text-[9px] font-black flex items-center justify-center rounded-full px-1 border-2 border-white shadow-sm">
              {totalInSilo + totalInSeeds}
            </span>
          )}
        </button>
        
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-semibold text-stone-400">Fazenda Aurora</span>
          <span className="text-sm font-bold text-stone-700 italic">"Onde o futuro cresce"</span>
        </div>
        <img 
          src="https://picsum.photos/seed/farm/40/40" 
          alt="Avatar" 
          className="w-10 h-10 rounded-xl border-2 border-stone-100"
        />
      </div>
    </header>
  );
};

export default Header;
