
import React from 'react';
import { ProgressSnapshot } from '../types';

interface EvolutionChartsProps {
  history: ProgressSnapshot[];
}

const EvolutionCharts: React.FC<EvolutionChartsProps> = ({ history }) => {
  const renderSparkline = (data: number[], color: string) => {
    if (data.length < 2) return <div className="h-20 flex items-center justify-center text-[10px] text-stone-400 uppercase font-black">Coletando dados...</div>;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 300;
    const height = 80;
    const padding = 5;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((val - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 drop-shadow-sm overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="animate-[draw_1s_ease-out]"
        />
        <style>{`
          @keyframes draw {
            from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
            to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
          }
        `}</style>
      </svg>
    );
  };

  const latestMoney = history.length > 0 ? history[history.length - 1].money : 0;
  const latestXP = history.length > 0 ? history[history.length - 1].xpTotal : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico Dinheiro */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm group">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Evolução Patrimonial</span>
              <h4 className="text-xl font-black text-stone-800">Capital Líquido</h4>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:rotate-12 transition-transform">
              <i className="fas fa-coins"></i>
            </div>
          </div>
          <div className="mb-4">
             {renderSparkline(history.map(s => s.money), '#d97706')}
          </div>
          <div className="flex justify-between items-end">
             <span className="text-2xl font-black text-stone-900 leading-none">R$ {latestMoney.toLocaleString()}</span>
             <span className="text-[10px] font-bold text-green-600">+ Fluxo Positivo</span>
          </div>
        </div>

        {/* Gráfico XP */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm group">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Experiência Acumulada</span>
              <h4 className="text-xl font-black text-stone-800">Progresso de Carreira</h4>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:-rotate-12 transition-transform">
              <i className="fas fa-star"></i>
            </div>
          </div>
          <div className="mb-4">
             {renderSparkline(history.map(s => s.xpTotal), '#16a34a')}
          </div>
          <div className="flex justify-between items-end">
             <span className="text-2xl font-black text-stone-900 leading-none">{latestXP.toLocaleString()} XP</span>
             <span className="text-[10px] font-bold text-blue-600">Em Ascensão</span>
          </div>
        </div>
      </div>
      
      <div className="bg-stone-900 text-white p-6 rounded-3xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
            <i className="fas fa-chart-line text-green-400"></i>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Performance Geral</p>
            <h5 className="font-bold">Dados capturados a cada 1 minuto</h5>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-400 block">Amostras atuais</span>
          <span className="font-black text-xl">{history.length}</span>
        </div>
      </div>
    </div>
  );
};

export default EvolutionCharts;
