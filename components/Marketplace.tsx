
import React from 'react';
import { GameState, CropType } from '../types';
import { CROPS } from '../constants';

interface MarketplaceProps {
  state: GameState;
  onBuySeeds: (crop: CropType, quantity: number) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ state, onBuySeeds }) => {
  const sortedCrops = Object.values(CROPS).sort((a, b) => a.unlockLevel - b.unlockLevel || a.cost - b.cost);

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="bg-gradient-to-r from-green-900 via-stone-800 to-green-900 text-white p-8 rounded-[2rem] mb-10 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative border border-stone-700">
        <div className="z-10 text-center md:text-left">
          <div className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-green-500/30">
            Mercado de Suprimentos
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tight">Loja de Sementes</h2>
          <p className="text-stone-400 text-sm max-w-md leading-relaxed">Adquira pacotes de sementes para iniciar seu plantio. Lembre-se: sem sementes, não há colheita!</p>
        </div>
        <div className="opacity-10 absolute -right-4 bottom-0 text-[12rem] select-none">
           <i className="fas fa-seedling"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCrops.map(crop => {
          const isLocked = state.level < crop.unlockLevel;
          const currentSeeds = state.seedInventory[crop.type] || 0;
          const canAfford = state.money >= crop.cost;
          
          return (
            <div key={crop.type} className={`bg-white p-6 rounded-3xl shadow-sm border transition-all duration-300 group flex flex-col relative
              ${isLocked ? 'border-stone-100 opacity-75 grayscale-[0.5]' : 'border-stone-200 hover:shadow-xl'}`}>
              
              {isLocked && (
                <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] rounded-3xl flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <i className="fas fa-lock text-xs"></i>
                  </div>
                  <span className="text-xs font-black text-stone-800 uppercase tracking-tighter leading-none mb-1">Nível {crop.unlockLevel}</span>
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Bloqueado</span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-5">
                <div className={`w-16 h-16 ${isLocked ? 'bg-stone-100' : 'bg-stone-50'} rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform`}>
                  {crop.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-stone-800 leading-tight">{crop.type}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Em estoque:</span>
                    <span className={`text-xs font-black ${currentSeeds > 0 ? 'text-green-600' : 'text-stone-300'}`}>{currentSeeds}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-stone-50 rounded-2xl p-4 mb-6 border border-stone-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-400 uppercase tracking-tighter">Custo p/ Semente</span>
                  <span className="font-black text-stone-800">R$ {crop.cost}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-400 uppercase tracking-tighter">Venda Futura</span>
                  <span className="font-black text-green-600">R$ {crop.salePrice}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  disabled={isLocked || !canAfford}
                  onClick={() => onBuySeeds(crop.type, 1)}
                  className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    canAfford && !isLocked 
                      ? 'bg-stone-900 text-white hover:bg-green-600 shadow-md' 
                      : 'bg-stone-100 text-stone-300'
                  }`}
                >
                  Comprar 1x
                </button>
                <button 
                  disabled={isLocked || state.money < crop.cost * 10}
                  onClick={() => onBuySeeds(crop.type, 10)}
                  className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    state.money >= crop.cost * 10 && !isLocked 
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                      : 'bg-stone-100 text-stone-300'
                  }`}
                >
                  Pack 10x
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Marketplace;
