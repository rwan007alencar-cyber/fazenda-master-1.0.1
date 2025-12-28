
import React from 'react';

interface SidebarProps {
  activeTab: 'fazenda' | 'mercado' | 'gestao' | 'ia' | 'imobiliaria' | 'noticias';
  setActiveTab: (tab: 'fazenda' | 'mercado' | 'gestao' | 'ia' | 'imobiliaria' | 'noticias') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'fazenda', icon: 'fa-seedling', label: 'Minha Fazenda' },
    { id: 'imobiliaria', icon: 'fa-sign-hanging', label: 'Imobiliária' },
    { id: 'mercado', icon: 'fa-shop', label: 'Mercado' },
    { id: 'gestao', icon: 'fa-user-gear', label: 'Gestão' },
    { id: 'noticias', icon: 'fa-newspaper', label: 'Notícias' },
    { id: 'ia', icon: 'fa-brain', label: 'Agro IA' },
  ];

  return (
    <aside className="w-full md:w-64 bg-stone-900 text-stone-400 flex flex-row md:flex-col z-20 sticky bottom-0 md:relative">
      <div className="hidden md:flex p-6 mb-4">
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <i className="fas fa-tractor text-green-500"></i>
          Fazenda Master
        </h1>
      </div>

      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-2 py-4 md:py-0">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`
              flex flex-col md:flex-row items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${activeTab === item.id 
                ? 'bg-stone-800 text-white' 
                : 'hover:bg-stone-800/50 hover:text-stone-300'}
            `}
          >
            <i className={`fas ${item.icon} text-lg`}></i>
            <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden md:block p-6 border-t border-stone-800">
        <div className="bg-stone-800/50 rounded-xl p-4 text-center">
          <p className="text-xs text-stone-500 mb-2">Versão 1.1.0-EVO</p>
          <div className="flex justify-center gap-3 text-sm opacity-50">
            Fazenda Master BR
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
