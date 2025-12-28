
import React from 'react';
import { NewsItem } from '../types';

interface FarmNewsProps {
  news: NewsItem[];
}

const FarmNews: React.FC<FarmNewsProps> = ({ news }) => {
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Agora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Há ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `Há ${hours}h`;
  };

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'harvest': return 'bg-green-100 text-green-700 border-green-200';
      case 'unlock': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'market': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'levelUp': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'harvest': return 'Colheita';
      case 'unlock': return 'Novo Desbloqueio';
      case 'market': return 'Mercado';
      case 'levelUp': return 'Novo Nível';
      default: return 'Geral';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Central de Notícias</h2>
          <p className="text-stone-500">Acompanhe as últimas atualizações da sua fazenda.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-stone-200 text-sm font-bold text-stone-600 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Feed em Tempo Real
        </div>
      </div>

      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-stone-200">
            <i className="fas fa-newspaper text-5xl text-stone-200 mb-4"></i>
            <p className="text-stone-400 font-medium">Nenhuma notícia relevante no momento.</p>
          </div>
        ) : (
          [...news].reverse().map((item) => (
            <div 
              key={item.id}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex items-start gap-6 transition-all hover:shadow-md group"
            >
              <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-stone-100 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getBadgeStyles(item.type)}`}>
                    {getLabel(item.type)}
                  </div>
                  <span className="text-xs font-bold text-stone-400">{formatTime(item.timestamp)}</span>
                </div>
                <h3 className="text-lg font-black text-stone-800 mb-1">{item.title}</h3>
                <p className="text-stone-500 leading-relaxed text-sm">
                  {item.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FarmNews;
