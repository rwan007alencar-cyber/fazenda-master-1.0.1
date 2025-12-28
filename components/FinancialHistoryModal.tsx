
import React from 'react';
import { Transaction } from '../types';

interface FinancialHistoryModalProps {
  history: Transaction[];
  onClose: () => void;
}

const FinancialHistoryModal: React.FC<FinancialHistoryModalProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-2xl font-black text-stone-800">Fluxo de Caixa</h2>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Histórico Recente de Transações</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {history.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-200 text-3xl mb-4 border-2 border-dashed border-stone-200">
                <i className="fas fa-receipt"></i>
              </div>
              <p className="text-stone-400 font-medium italic">Nenhuma movimentação registrada.</p>
            </div>
          ) : (
            [...history].reverse().map((tx) => (
              <div key={tx.id} className="bg-white border border-stone-100 rounded-2xl p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${
                    tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <i className={`fas ${tx.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-800">{tx.description}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black uppercase tracking-tighter text-stone-400 bg-stone-200/50 px-1.5 py-0.5 rounded">
                        {tx.category}
                      </span>
                      <span className="text-[10px] text-stone-300">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-black ${
                  tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR')}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-sm hover:bg-stone-800 transition-all shadow-lg"
          >
            FECHAR HISTÓRICO
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialHistoryModal;
