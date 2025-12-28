
import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { getFarmAdvice } from '../services/geminiService';

interface AIAdvisorProps {
  state: GameState;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ state }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await getFarmAdvice(state);
    setAdvice(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200">
        <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <i className="fas fa-robot text-3xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Agro IA Consultoria</h2>
              <p className="text-green-100 opacity-80 text-sm">Inteligência artificial analisando seu progresso.</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 min-h-[200px] flex flex-col justify-center relative">
            {loading ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-stone-400 text-sm font-medium">Analisando dados do solo e mercado...</p>
              </div>
            ) : advice ? (
              <div className="space-y-4">
                <div className="text-stone-700 leading-relaxed whitespace-pre-line font-medium italic">
                  "{advice}"
                </div>
                <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Consultoria Estratégica</span>
                  <button 
                    onClick={fetchAdvice}
                    className="text-green-600 hover:text-green-700 text-xs font-bold flex items-center gap-1"
                  >
                    <i className="fas fa-sync-alt"></i> Atualizar Dica
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-stone-400 italic">Clique no botão para receber sua consultoria personalizada.</p>
                <button 
                   onClick={fetchAdvice}
                   className="mt-4 px-6 py-2 bg-stone-900 text-white rounded-lg text-sm font-bold"
                >
                  Pedir Conselhos
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Status Solo</span>
              <span className="text-green-600 text-xs font-bold">EXCELENTE</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Tendência</span>
              <span className="text-blue-600 text-xs font-bold">ALTA</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Risco</span>
              <span className="text-amber-600 text-xs font-bold">BAIXO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
