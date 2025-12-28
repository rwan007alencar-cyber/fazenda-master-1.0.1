
import React, { useState, useEffect } from 'react';
import { GameState, FarmTier } from '../types';
import { FARM_TIERS } from '../constants';

interface FarmShopProps {
  state: GameState;
  onBuy: (tier: FarmTier) => void;
}

const SafeImage: React.FC<{ src: string; alt: string; farmId: string }> = ({ src, alt, farmId }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Forçar nova tentativa de carregamento se a URL mudar
  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  if (error) {
    return (
      <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center p-6 text-center border-b border-stone-200">
        <i className="fas fa-mountain-sun text-stone-300 text-4xl mb-3"></i>
        <div className="space-y-1">
          <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Imagem não carregada</span>
          <button 
            onClick={() => { setError(false); setLoaded(false); }}
            className="text-[9px] text-blue-500 font-bold hover:underline uppercase"
          >
            Tentar recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-stone-50">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
          <div className="w-6 h-6 border-2 border-stone-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        key={`img-${farmId}`}
        src={src} 
        alt={alt} 
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          console.warn(`Erro ao carregar imagem para ${farmId}. Tentando fallback...`);
          setError(true);
        }}
      />
    </div>
  );
};

const FarmShop: React.FC<FarmShopProps> = ({ state, onBuy }) => {
  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="mb-12 text-center md:text-left">
        <h2 className="text-4xl font-black text-stone-800 tracking-tight">Imobiliária Rural</h2>
        <p className="text-stone-500 mt-2 text-lg">Seu próximo grande passo no agronegócio começa aqui.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {FARM_TIERS.map(tier => {
          const isOwned = state.ownedFarmId === tier.id;
          const canAfford = state.money >= tier.price;

          return (
            <div 
              key={tier.id} 
              className={`bg-white rounded-[2.5rem] overflow-hidden shadow-sm border-2 transition-all flex flex-col ${
                isOwned 
                  ? 'border-green-500 ring-8 ring-green-50 scale-[1.02] shadow-xl' 
                  : 'border-stone-100 hover:border-stone-200 hover:shadow-2xl'
              }`}
            >
              <div className="h-52 overflow-hidden relative group">
                <SafeImage src={tier.image} alt={tier.name} farmId={tier.id} />
                
                {isOwned && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full z-10 shadow-lg border-2 border-white">
                    PROPRIEDADE ATUAL
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-5 left-6 right-6">
                   <span className="text-white font-black text-2xl drop-shadow-lg tracking-tight leading-tight">{tier.name}</span>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <p className="text-stone-500 text-sm mb-6 flex-1 leading-relaxed italic opacity-80">
                  {tier.description}
                </p>
                
                <div className="bg-stone-50 p-5 rounded-3xl space-y-4 mb-8 border border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                      <i className="fas fa-layer-group"></i> Capacidade
                    </span>
                    <span className="text-stone-800 font-black">{tier.plotCount} Lotes</span>
                  </div>
                  <div className="h-px bg-stone-200/50"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                      <i className="fas fa-money-bill-wave"></i> Valor
                    </span>
                    <span className="text-green-600 font-black text-lg">R$ {tier.price.toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <button
                  disabled={isOwned || !canAfford}
                  onClick={() => onBuy(tier)}
                  className={`w-full py-5 rounded-[1.25rem] font-black transition-all shadow-lg active:scale-95 text-sm tracking-wide ${
                    isOwned 
                      ? 'bg-green-100 text-green-600 cursor-default shadow-none border border-green-200' 
                      : canAfford 
                        ? 'bg-stone-900 text-white hover:bg-green-600 hover:shadow-green-200' 
                        : 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none border border-stone-200'
                  }`}
                >
                  {isOwned ? 'FAZENDA ATIVA' : canAfford ? 'ASSINAR ESCRITURA' : 'SALDO INSUFICIENTE'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 bg-amber-50 border-2 border-amber-100 p-10 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-10 shadow-sm">
        <div className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center text-white text-3xl shrink-0 shadow-xl shadow-amber-200/50">
          <i className="fas fa-lightbulb"></i>
        </div>
        <div>
          <h4 className="font-black text-amber-900 text-2xl mb-2 tracking-tight">Dica de Gestão</h4>
          <p className="text-amber-800/60 text-base leading-relaxed max-w-3xl">
            A expansão para novas terras é o momento de maior risco financeiro. Sempre mantenha uma reserva para o plantio inicial da nova área adquirida!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmShop;
