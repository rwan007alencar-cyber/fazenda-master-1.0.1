
import React, { useState, useEffect } from 'react';
import { FarmPlot, CropType } from '../types';
import { CROPS } from '../constants';

interface FarmPlotProps {
  plot: FarmPlot;
  playerLevel: number;
  seedInventory: Record<string, number>;
  efficiencyMultiplier: number;
  siloCapacity: number;
  currentCropStock: number;
  onPlant: (crop: CropType) => void;
  onHarvest: (event: React.MouseEvent) => void;
}

const FarmPlotComponent: React.FC<FarmPlotProps> = ({ 
  plot, 
  playerLevel, 
  seedInventory, 
  efficiencyMultiplier, 
  siloCapacity,
  currentCropStock,
  onPlant, 
  onHarvest 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const currentCrop = plot.crop ? CROPS[plot.crop] : null;
  const isSiloFull = currentCropStock >= siloCapacity;

  useEffect(() => {
    let interval: number | undefined;
    if (plot.crop && plot.plantedAt && !plot.isHarvestable) {
      const updateStatus = () => {
        const cropData = CROPS[plot.crop!];
        const adjustedGrowthTime = cropData.growthTime * efficiencyMultiplier;
        const elapsed = (Date.now() - plot.plantedAt!) / 1000;
        
        const p = Math.min(100, (elapsed / adjustedGrowthTime) * 100);
        const remaining = Math.max(0, Math.ceil(adjustedGrowthTime - elapsed));
        
        setProgress(p);
        setTimeLeft(remaining);
      };
      
      updateStatus();
      interval = window.setInterval(updateStatus, 100);
    } else {
      setProgress(plot.isHarvestable ? 100 : 0);
      setTimeLeft(0);
    }
    return () => clearInterval(interval);
  }, [plot.crop, plot.plantedAt, plot.isHarvestable, efficiencyMultiplier]);

  if (plot.isHarvestable && currentCrop) {
    return (
      <button 
        onClick={(e) => onHarvest(e)}
        className={`group relative aspect-square rounded-3xl flex flex-col items-center justify-center transition-all duration-300 border-2
          ${isSiloFull 
            ? 'bg-red-50 border-red-200 grayscale-[0.5]' 
            : 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:scale-[1.05] hover:shadow-2xl hover:shadow-amber-200/40 hover:border-amber-400 animate-[pulse_3s_infinite]'}`}
      >
        <div className="text-5xl mb-2 drop-shadow-md transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
          {currentCrop.icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-colors 
          ${isSiloFull 
            ? 'bg-red-200 text-red-800' 
            : 'bg-amber-200/50 text-amber-800 group-hover:bg-amber-400 group-hover:text-white'}`}>
          {isSiloFull ? 'Silo Cheio' : 'Colher!'}
        </span>
        <div className={`absolute -top-2 -right-2 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white animate-pulse
          ${isSiloFull ? 'bg-red-500' : 'bg-green-500'}`}>
          {isSiloFull ? 'AVISO' : 'PRONTO'}
        </div>
      </button>
    );
  }

  if (plot.crop) {
    const scale = 0.3 + (progress / 100) * 0.7;
    const opacity = 0.4 + (progress / 100) * 0.6;

    return (
      <div className="bg-stone-100 border-2 border-stone-200 aspect-square rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
        <div 
          className="text-4xl mb-3 transition-transform duration-500 ease-out flex items-center justify-center"
          style={{ 
            transform: `scale(${scale})`,
            opacity: opacity,
            filter: progress < 100 ? 'grayscale(0.5)' : 'none'
          }}
        >
          {currentCrop?.icon}
        </div>
        
        <div className="w-20 h-2 bg-stone-200 rounded-full overflow-hidden border border-stone-300 shadow-inner">
          <div 
            className="h-full bg-green-500 transition-all duration-300 ease-linear shadow-[0_0_8px_rgba(34,197,94,0.5)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="mt-2 flex flex-col items-center">
          <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">
            Faltam {timeLeft}s
          </span>
        </div>
      </div>
    );
  }

  // Filtrar apenas as culturas que possuem sementes no estoque
  const availableCropTypes = (Object.keys(CROPS) as CropType[]).filter(
    type => (seedInventory[type] || 0) > 0
  );

  return (
    <div className="relative aspect-square">
      <button 
        onClick={() => setShowPicker(!showPicker)}
        className="w-full h-full bg-stone-50 border-2 border-dashed border-stone-300 rounded-3xl flex flex-col items-center justify-center text-stone-400 hover:border-green-400 hover:text-green-500 hover:bg-green-50 transition-all group shadow-sm"
      >
        <i className="fas fa-plus text-xl mb-2"></i>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Plantar</span>
      </button>

      {showPicker && (
        <div className="absolute inset-0 w-full h-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl z-20 p-3 border-2 border-stone-200 flex flex-col animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Sementes</span>
            <button onClick={() => setShowPicker(false)} className="text-stone-300 hover:text-red-500">
              <i className="fas fa-times-circle text-lg"></i>
            </button>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-1.5 overflow-y-auto pr-1">
            {availableCropTypes.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-6 text-center">
                <i className="fas fa-box-open text-stone-200 text-2xl mb-2"></i>
                <p className="text-[8px] font-black text-stone-400 uppercase leading-tight tracking-tighter">Estoque Vazio</p>
                <p className="text-[7px] text-stone-300 uppercase mt-1">Vá ao Mercado</p>
              </div>
            ) : (
              availableCropTypes.map(type => {
                const crop = CROPS[type];
                const isLocked = playerLevel < crop.unlockLevel;
                const seedCount = seedInventory[type] || 0;

                return (
                  <button
                    key={type}
                    disabled={isLocked}
                    onClick={() => {
                      onPlant(type);
                      setShowPicker(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all relative
                      ${isLocked ? 'opacity-40 grayscale bg-stone-50' : 'hover:bg-green-50 hover:border-green-200'}`}
                  >
                    <span className="text-xl">{crop.icon}</span>
                    <div className="mt-1 flex flex-col items-center">
                      {isLocked ? (
                        <span className="text-[7px] font-black text-stone-400 leading-none">NV {crop.unlockLevel}</span>
                      ) : (
                        <span className="text-[8px] font-black leading-none text-green-600">
                          {seedCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmPlotComponent;
