
import React, { useState } from 'react';
import { CROPS } from '../constants';
import { CropType } from '../types';

interface WarehouseModalProps {
  inventory: Record<string, number>;
  seedInventory: Record<string, number>;
  marketTrend?: { crop: string; multiplier: number };
  staffCount: number;
  capacityPerCrop: number;
  onSellAll: () => void;
  onSellCrop: (cropName: string) => void;
  onClose: () => void;
  onGoToMarket?: () => void;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({ 
  inventory, 
  seedInventory, 
  marketTrend, 
  staffCount, 
  capacityPerCrop,
  onSellAll, 
  onSellCrop, 
  onClose,
  onGoToMarket 
}) => {
  const [activeTab, setActiveTab] = useState<'silo' | 'sementes'>('silo');
  
  const inventoryItems = (Object.entries(inventory) as [string, number][]).filter(([_, qty]) => qty > 0);
  const seedItems = (Object.entries(seedInventory) as [string, number][]).filter(([_, qty]) => qty > 0);
  const staffBonus = 1 + (staffCount * 0.02);

  let totalSiloValue = 0;
  inventoryItems.forEach(([cropName, qty]) => {
    const cropType = cropName as CropType;
    const cropData = CROPS[cropType];
    if (!cropData) return;
    let multiplier = marketTrend?.crop === cropName ? marketTrend.multiplier : 1;
    const pricePerUnit = Math.floor(cropData.salePrice * staffBonus * multiplier);
    totalSiloValue += pricePerUnit * qty;
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header com Abas */}
        <div className="bg-stone-50 border-b border-stone-100 p-2">
          <div className="flex p-1 bg-stone-200/50 rounded-2xl">
            <button 
              onClick={() => setActiveTab('silo')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'silo' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <i className="fas fa-warehouse mr-2"></i> Silo de Grãos
            </button>
            <button 
              onClick={() => setActiveTab('sementes')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sementes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <i className="fas fa-seedling mr-2"></i> Armazém de Sementes
            </button>
          </div>
        </div>

        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-800">
              {activeTab === 'silo' ? 'Silo de Grãos' : 'Armazém de Sementes'}
            </h2>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
              {activeTab === 'silo' ? `Capacidade por cultura: ${capacityPerCrop} unidades` : 'Suprimentos para plantio'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'silo' ? (
            inventoryItems.length === 0 ? (
              <EmptyState icon="fa-box-open" title="Silo Vazio" subtitle="Colha suas plantações para estocar produtos." />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {inventoryItems.map(([cropName, qty]) => {
                  const cropType = cropName as CropType;
                  const cropData = CROPS[cropType];
                  const isTrending = marketTrend?.crop === cropName;
                  const multiplier = isTrending ? marketTrend!.multiplier : 1;
                  const finalPrice = Math.floor(cropData.salePrice * staffBonus * multiplier);
                  return (
                    <SiloItem 
                      key={cropName}
                      cropName={cropName}
                      qty={qty}
                      capacity={capacityPerCrop}
                      icon={cropData.icon}
                      isTrending={isTrending}
                      totalPrice={finalPrice * qty}
                      onSell={() => onSellCrop(cropName)}
                    />
                  );
                })}
              </div>
            )
          ) : (
            seedItems.length === 0 ? (
              <EmptyState icon="fa-seedling" title="Armazém de Sementes Vazio" subtitle="Visite o mercado para comprar novas sementes." />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {seedItems.map(([cropName, qty]) => {
                  const cropType = cropName as CropType;
                  const cropData = CROPS[cropType];
                  return (
                    <SeedItem 
                      key={cropName}
                      cropName={cropName}
                      qty={qty}
                      icon={cropData.icon}
                      costPerUnit={cropData.cost}
                    />
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Footer Dinâmico */}
        <div className="p-8 bg-stone-50 border-t border-stone-100">
          {activeTab === 'silo' ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-black text-stone-400 uppercase tracking-widest block">Valor Total do Silo</span>
                  <span className="text-3xl font-black text-green-600">R$ {totalSiloValue.toLocaleString()}</span>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-bold text-stone-400 block uppercase">Bônus da Equipe</span>
                   <span className="font-black text-blue-600">+{Math.round((staffBonus - 1) * 100)}%</span>
                </div>
              </div>
              <button 
                disabled={inventoryItems.length === 0}
                onClick={onSellAll}
                className={`w-full py-5 rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-3 ${
                  inventoryItems.length === 0 ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-1'
                }`}
              >
                <i className="fas fa-hand-holding-dollar"></i> VENDER TODO O SILO
              </button>
            </>
          ) : (
            <button 
              onClick={() => { onClose(); onGoToMarket?.(); }}
              className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-3 hover:bg-stone-800"
            >
              <i className="fas fa-shop"></i> IR AO MERCADO COMPRAR MAIS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, subtitle }: { icon: string, title: string, subtitle: string }) => (
  <div className="py-20 text-center flex flex-col items-center">
    <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-stone-200 text-4xl mb-4 border-2 border-dashed border-stone-200">
      <i className={`fas ${icon}`}></i>
    </div>
    <p className="text-stone-400 font-black italic uppercase tracking-tighter">{title}</p>
    <p className="text-stone-400 text-sm mt-1">{subtitle}</p>
  </div>
);

interface SiloItemProps {
  cropName: string;
  qty: number;
  capacity: number;
  icon: string;
  isTrending: boolean;
  totalPrice: number;
  onSell: () => void;
}

const SiloItem: React.FC<SiloItemProps> = ({ cropName, qty, capacity, icon, isTrending, totalPrice, onSell }) => {
  const percent = Math.min(100, (qty / capacity) * 100);
  const isFull = qty >= capacity;

  return (
    <div className={`bg-white border rounded-3xl p-4 transition-all group ${isTrending ? 'border-blue-200 bg-blue-50/30' : 'border-stone-100 hover:border-amber-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl border border-stone-100 shadow-inner group-hover:scale-105 transition-transform">{icon}</div>
          <div>
            <h4 className="font-black text-stone-800 flex items-center gap-2 text-sm md:text-base">
              {cropName} {isTrending && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase animate-pulse whitespace-nowrap">Alta!</span>}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold ${isFull ? 'text-red-500' : 'text-stone-400'}`}>
                {qty} / {capacity} no silo
              </span>
            </div>
          </div>
        </div>
        <button onClick={onSell} className="px-4 py-2 bg-stone-100 text-stone-600 hover:bg-green-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">Vender</button>
      </div>
      
      {/* Barra de Progresso do Silo */}
      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-green-500'}`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

interface SeedItemProps {
  cropName: string;
  qty: number;
  icon: string;
  costPerUnit: number;
}

const SeedItem: React.FC<SeedItemProps> = ({ cropName, qty, icon, costPerUnit }) => (
  <div className="bg-white border border-stone-100 rounded-3xl p-4 flex items-center justify-between hover:border-blue-200 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl border border-stone-100 shadow-inner">{icon}</div>
      <div>
        <h4 className="font-black text-stone-800">{cropName} (Semente)</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs font-bold text-blue-600">Em estoque: {qty}</span>
          <span className="text-[10px] font-bold text-stone-400">Custo: R$ {costPerUnit}/un</span>
        </div>
      </div>
    </div>
    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
       <i className="fas fa-check-circle"></i>
    </div>
  </div>
);

export default WarehouseModal;
