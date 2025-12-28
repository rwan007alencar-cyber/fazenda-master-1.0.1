
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, CropType, FarmPlot, FarmTier, NewsItem, Transaction, ProgressSnapshot } from './types';
import { INITIAL_STATE, CROPS, XP_PER_LEVEL, FARM_TIERS } from './constants';
import FarmPlotComponent from './components/FarmPlot';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Marketplace from './components/Marketplace';
import AIAdvisor from './components/AIAdvisor';
import FarmShop from './components/FarmShop';
import FarmNews from './components/FarmNews';
import FinancialHistoryModal from './components/FinancialHistoryModal';
import EvolutionCharts from './components/EvolutionCharts';
import WarehouseModal from './components/WarehouseModal';

interface VisualEffect {
  id: number;
  x: number;
  y: number;
  icon?: string;
  text?: string;
  type: 'float' | 'fly';
}

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('fazenda_master_state_v3');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  
  const [activeTab, setActiveTab] = useState<'fazenda' | 'mercado' | 'gestao' | 'ia' | 'imobiliaria' | 'noticias'>('fazenda');
  const [effects, setEffects] = useState<VisualEffect[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showAutoPlantMenu, setShowAutoPlantMenu] = useState(false);
  const [showAutoHarvestMenu, setShowAutoHarvestMenu] = useState(false);
  const nextEffectId = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Capacidade do silo: 3x o número de lotes por cultura
  const siloCapacityPerCrop = state.plots.length * 3;

  // Persistence
  useEffect(() => {
    localStorage.setItem('fazenda_master_state_v3', JSON.stringify(state));
  }, [state]);

  const efficiencyMultiplier = Math.max(0.25, 1 - (state.machineryCount * 0.05));

  const addTransaction = useCallback((type: 'income' | 'expense', amount: number, description: string, category: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      description,
      timestamp: Date.now(),
      category
    };
    setState(prev => ({
      ...prev,
      financialHistory: [...prev.financialHistory.slice(-49), newTx]
    }));
  }, []);

  const addNews = useCallback((type: NewsItem['type'], title: string, message: string, icon: string) => {
    const newItem: NewsItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: Date.now(),
      icon
    };
    setState(prev => ({
      ...prev,
      news: [...prev.news.slice(-19), newItem]
    }));
  }, []);

  // Growth loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setState(prev => {
        let changed = false;
        const newPlots = prev.plots.map(plot => {
          if (plot.crop && plot.plantedAt && !plot.isHarvestable) {
            const cropData = CROPS[plot.crop];
            const adjustedGrowthTime = cropData.growthTime * efficiencyMultiplier;
            const elapsed = (now - plot.plantedAt) / 1000;
            if (elapsed >= adjustedGrowthTime) {
              changed = true;
              return { ...plot, isHarvestable: true };
            }
          }
          return plot;
        });
        return changed ? { ...prev, plots: newPlots } : prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [efficiencyMultiplier]);

  // Take Snapshot Loop (every 1 minute)
  useEffect(() => {
    const takeSnapshot = () => {
      setState(prev => {
        const xpTotal = prev.level * XP_PER_LEVEL + prev.xp;
        const newSnapshot: ProgressSnapshot = {
          timestamp: Date.now(),
          money: prev.money,
          xpTotal: xpTotal,
          level: prev.level
        };
        return {
          ...prev,
          evolutionHistory: [...prev.evolutionHistory.slice(-59), newSnapshot]
        };
      });
    };
    const interval = setInterval(takeSnapshot, 60000);
    return () => clearInterval(interval);
  }, []);

  // Periodic Market Trends
  useEffect(() => {
    const interval = setInterval(() => {
      const crops = Object.keys(CROPS) as CropType[];
      const randomCrop = crops[Math.floor(Math.random() * crops.length)];
      const multiplier = 1.2 + Math.random() * 0.5;
      
      setState(prev => ({
        ...prev,
        marketTrend: { crop: randomCrop, multiplier }
      }));

      addNews(
        'market',
        `Alta no Mercado: ${randomCrop}`,
        `A demanda por ${randomCrop} aumentou! O preço de venda está ${(multiplier * 100 - 100).toFixed(0)}% maior por tempo limitado.`,
        CROPS[randomCrop].icon
      );
    }, 120000);
    return () => clearInterval(interval);
  }, [addNews]);

  const handleBuyFarm = (tier: FarmTier) => {
    if (state.money < tier.price) return;
    addTransaction('expense', tier.price, `Compra da propriedade ${tier.name}`, 'Imobiliária');
    setState(prev => ({
      ...prev,
      money: prev.money - tier.price,
      ownedFarmId: tier.id,
      plots: Array.from({ length: tier.plotCount }, (_, i) => ({ id: i, isHarvestable: false }))
    }));
    addNews('unlock', 'Nova Propriedade!', `Você adquiriu o ${tier.name} por R$ ${tier.price.toLocaleString()}. Sua capacidade agora é de ${tier.plotCount} lotes.`, '🏠');
    setActiveTab('fazenda');
  };

  const handleBuySeeds = (crop: CropType, quantity: number) => {
    const cropData = CROPS[crop];
    const totalCost = cropData.cost * quantity;
    if (state.money < totalCost || state.level < cropData.unlockLevel) return;

    addTransaction('expense', totalCost, `Compra de ${quantity}x Sementes de ${crop}`, 'Mercado');
    
    setState(prev => {
      const newSeeds = { ...prev.seedInventory };
      newSeeds[crop] = (newSeeds[crop] || 0) + quantity;
      return {
        ...prev,
        money: prev.money - totalCost,
        seedInventory: newSeeds
      };
    });
  };

  const handlePlant = (plotId: number, crop: CropType) => {
    const seedsAvailable = state.seedInventory[crop] || 0;
    if (seedsAvailable <= 0) return;
    
    setState(prev => {
      const newSeeds = { ...prev.seedInventory };
      newSeeds[crop] = newSeeds[crop] - 1;
      
      return {
        ...prev,
        seedInventory: newSeeds,
        plots: prev.plots.map(p => 
          p.id === plotId ? { ...p, crop, plantedAt: Date.now(), isHarvestable: false } : p
        )
      };
    });
  };

  const handleAutoPlant = (crop: CropType) => {
    if (!state.autoPlantUnlocked) return;
    setState(prev => {
      const seedsAvailable = prev.seedInventory[crop] || 0;
      const emptyPlots = prev.plots.filter(p => !p.crop);
      
      if (seedsAvailable <= 0 || emptyPlots.length === 0) return prev;
      
      let seedsToUse = Math.min(seedsAvailable, emptyPlots.length);
      let usedCount = 0;
      
      const newPlots = prev.plots.map(plot => {
        if (!plot.crop && usedCount < seedsToUse) {
          usedCount++;
          return { ...plot, crop, plantedAt: Date.now(), isHarvestable: false };
        }
        return plot;
      });

      const newSeedInventory = { ...prev.seedInventory };
      newSeedInventory[crop] -= usedCount;

      addNews('harvest', 'Plantio em Massa', `Você plantou ${usedCount}x ${crop} automaticamente.`, CROPS[crop].icon);

      return {
        ...prev,
        seedInventory: newSeedInventory,
        plots: newPlots
      };
    });
    setShowAutoPlantMenu(false);
  };

  const handleAutoHarvest = (crop: CropType) => {
    if (!state.autoHarvestUnlocked) return;
    setState(prev => {
      const harvestablePlots = prev.plots.filter(p => p.crop === crop && p.isHarvestable);
      if (harvestablePlots.length === 0) return prev;

      const currentStock = prev.inventory[crop] || 0;
      const spaceLeft = siloCapacityPerCrop - currentStock;

      if (spaceLeft <= 0) {
        addNews('market', 'Silo Cheio!', `Não há espaço para mais ${crop} no silo.`, '🚫');
        return prev;
      }

      // Colhe apenas o que cabe
      const plotsToHarvest = harvestablePlots.slice(0, spaceLeft);
      const totalHarvested = plotsToHarvest.length;

      const totalXP = totalHarvested * 25;
      const newXP = prev.xp + totalXP;
      const leveledUp = newXP >= prev.level * XP_PER_LEVEL;

      const newInventory = { ...prev.inventory };
      const currentCropName = crop as string;
      newInventory[currentCropName] = currentStock + totalHarvested;

      const plotIdsToClear = new Set(plotsToHarvest.map(p => p.id));
      const newPlots = prev.plots.map(p => {
        if (plotIdsToClear.has(p.id)) {
          return { ...p, crop: undefined, plantedAt: undefined, isHarvestable: false };
        }
        return p;
      });

      if (leveledUp) {
        const nextLevel = prev.level + 1;
        setTimeout(() => {
          addNews('levelUp', `Nível ${nextLevel}!`, `Colheita massiva rendeu novos horizontes.`, '⭐');
        }, 500);
      }

      addNews('harvest', 'Colheita em Massa', `Você colheu ${totalHarvested}x ${crop} de uma vez.`, CROPS[crop].icon);

      return {
        ...prev,
        inventory: newInventory,
        xp: leveledUp ? newXP - (prev.level * XP_PER_LEVEL) : newXP,
        level: leveledUp ? prev.level + 1 : prev.level,
        plots: newPlots
      };
    });
    setShowAutoHarvestMenu(false);
  };

  const handleHarvest = (plotId: number, event: React.MouseEvent) => {
    const plot = state.plots.find(p => p.id === plotId);
    if (!plot || !plot.crop || !plot.isHarvestable) return;

    const currentStock = state.inventory[plot.crop] || 0;
    if (currentStock >= siloCapacityPerCrop) {
      // Feedback visual de silo cheio
      const clickX = event.clientX;
      const clickY = event.clientY;
      const fullEffect: VisualEffect = {
        id: nextEffectId.current++,
        x: clickX,
        y: clickY,
        text: `Silo Cheio!`,
        type: 'float'
      };
      setEffects(prev => [...prev, fullEffect]);
      setTimeout(() => {
        setEffects(prev => prev.filter(e => e.id !== fullEffect.id));
      }, 1500);
      return;
    }

    const cropData = CROPS[plot.crop];
    const harvestXP = 25;

    // Criar efeitos visuais
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    const flyEffect: VisualEffect = {
      id: nextEffectId.current++,
      x: clickX,
      y: clickY,
      icon: cropData.icon,
      type: 'fly'
    };

    const textEffect: VisualEffect = {
      id: nextEffectId.current++,
      x: clickX,
      y: clickY,
      text: `No Silo!`,
      type: 'float'
    };

    setEffects(prev => [...prev, flyEffect, textEffect]);
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== flyEffect.id && e.id !== textEffect.id));
    }, 2000);
    
    setState(prev => {
      const newXP = prev.xp + harvestXP;
      const leveledUp = newXP >= prev.level * XP_PER_LEVEL;
      
      const newInventory = { ...prev.inventory };
      const currentCropName = plot.crop as string;
      newInventory[currentCropName] = (newInventory[currentCropName] || 0) + 1;

      if (leveledUp) {
        const nextLevel = prev.level + 1;
        const unlockedCrops = Object.values(CROPS).filter(c => c.unlockLevel === nextLevel);
        
        setTimeout(() => {
          addNews(
            'levelUp', 
            `Nível ${nextLevel} Alcançado!`, 
            `Sua experiência cresceu. Agora você pode plantar: ${unlockedCrops.map(c => c.type).join(', ') || 'Novas variedades em breve'}.`, 
            '⭐'
          );
        }, 500);
      }

      return {
        ...prev,
        inventory: newInventory,
        xp: leveledUp ? newXP - (prev.level * XP_PER_LEVEL) : newXP,
        level: leveledUp ? prev.level + 1 : prev.level,
        plots: prev.plots.map(p => 
          p.id === plotId ? { ...p, crop: undefined, plantedAt: undefined, isHarvestable: false } : p
        )
      };
    });
  };

  const handleSellCrop = useCallback((cropName: string) => {
    const quantity = state.inventory[cropName];
    if (!quantity || quantity <= 0) return;

    const cropType = cropName as CropType;
    const cropData = CROPS[cropType];
    if (!cropData) return;

    const staffBonus = 1 + (state.staffCount * 0.02);
    let multiplier = 1;
    if (state.marketTrend?.crop === cropName) {
      multiplier = state.marketTrend.multiplier;
    }

    const pricePerUnit = Math.floor(cropData.salePrice * staffBonus * multiplier);
    const totalGain = pricePerUnit * quantity;

    addTransaction('income', totalGain, `Venda de ${quantity}x ${cropName}`, 'Mercado');
    
    setState(prev => {
      const newInventory = { ...prev.inventory };
      delete newInventory[cropName];
      return {
        ...prev,
        money: prev.money + totalGain,
        inventory: newInventory
      };
    });
  }, [state.inventory, state.staffCount, state.marketTrend, addTransaction]);

  const handleSellAll = useCallback(() => {
    const inventoryKeys = Object.keys(state.inventory);
    if (inventoryKeys.length === 0) return;

    let totalGain = 0;
    const staffBonus = 1 + (state.staffCount * 0.02);

    inventoryKeys.forEach(cropKey => {
      const cropName = cropKey as string;
      const quantity = state.inventory[cropName];
      const cropType = cropName as CropType;
      const cropData = CROPS[cropType];
      if (!cropData) return;

      let multiplier = 1;
      if (state.marketTrend?.crop === cropName) {
        multiplier = state.marketTrend.multiplier;
      }

      const pricePerUnit = Math.floor(cropData.salePrice * staffBonus * multiplier);
      totalGain += pricePerUnit * quantity;
    });

    if (totalGain > 0) {
      addTransaction('income', totalGain, `Venda total do silo`, 'Mercado');
      addNews('market', 'Limpeza do Silo', `Toda a produção foi vendida por R$ ${totalGain.toLocaleString()}.`, '💰');
      
      setState(prev => ({
        ...prev,
        money: prev.money + totalGain,
        inventory: {}
      }));
      setShowWarehouseModal(false);
    }
  }, [state.inventory, state.staffCount, state.marketTrend, addTransaction, addNews]);

  // Backup functionality
  const exportGameState = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `fazenda_master_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importGameState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.money !== undefined && json.level !== undefined) {
          setState(json);
          addNews('unlock', 'Backup Restaurado!', 'Seu progresso foi carregado com sucesso.', '💾');
          alert('Backup carregado com sucesso!');
        } else {
          throw new Error('Formato inválido');
        }
      } catch (err) {
        alert('Erro ao carregar o backup. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const currentFarm = FARM_TIERS.find(f => f.id === state.ownedFarmId);

  // Filtro de sementes disponíveis para o menu de plantio automático
  const availableSeedsForAuto: CropType[] = (Object.keys(CROPS) as CropType[]).filter(
    type => (state.seedInventory[type] || 0) > 0
  );

  // Filtro de culturas prontas para colheita automática
  const readyToHarvestCrops: CropType[] = Array.from(new Set(
    state.plots
      .filter((p): p is FarmPlot & { crop: CropType } => p.crop !== undefined && p.isHarvestable)
      .map(p => p.crop)
  ));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header 
          state={state} 
          onOpenFinancialHistory={() => setShowHistoryModal(true)} 
          onOpenWarehouse={() => setShowWarehouseModal(true)}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {(!state.ownedFarmId && activeTab !== 'imobiliaria') ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center text-stone-400">
                <i className="fas fa-lock text-4xl"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black text-stone-800">Território não Adquirido</h2>
                <p className="text-stone-500 mt-2 max-w-md">Você possui R$ {state.money.toLocaleString()} mas ainda não tem onde plantar. Visite a Imobiliária para começar.</p>
              </div>
              <button 
                onClick={() => setActiveTab('imobiliaria')}
                className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all"
              >
                IR PARA IMOBILIÁRIA
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'fazenda' && (
                <div className="max-w-6xl mx-auto">
                  {state.marketTrend && (
                    <div className="mb-6 bg-blue-600 text-white p-4 rounded-3xl shadow-lg flex items-center justify-between animate-[fadeIn_0.5s_ease-out]">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl bg-white/20 p-2 rounded-xl">{CROPS[state.marketTrend.crop].icon}</div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Evento de Mercado</p>
                          <h4 className="font-bold">O preço do {state.marketTrend.crop} disparou! (+{(state.marketTrend.multiplier * 100 - 100).toFixed(0)}%)</h4>
                        </div>
                      </div>
                      <i className="fas fa-chart-line text-2xl opacity-40"></i>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800">{currentFarm?.name}</h2>
                      <p className="text-stone-400 text-sm">{state.plots.filter(p => !p.crop).length} lotes livres de {currentFarm?.plotCount}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {state.autoPlantUnlocked && (
                        <button 
                          onClick={() => { setShowAutoPlantMenu(!showAutoPlantMenu); setShowAutoHarvestMenu(false); }}
                          className={`px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm border
                          ${showAutoPlantMenu 
                            ? 'bg-amber-100 text-amber-700 border-amber-200' 
                            : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:text-amber-600'}`}
                        >
                          <i className="fas fa-bolt"></i> Plantar Tudo
                        </button>
                      )}
                      
                      {state.autoHarvestUnlocked && (
                        <button 
                          onClick={() => { setShowAutoHarvestMenu(!showAutoHarvestMenu); setShowAutoPlantMenu(false); }}
                          className={`px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm border
                          ${showAutoHarvestMenu 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-white text-stone-600 border-stone-200 hover:border-green-300 hover:text-green-600'}`}
                        >
                          <i className="fas fa-tractor"></i> Colher Tudo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Menu de Plantio Automático */}
                  {showAutoPlantMenu && (
                    <div className="mb-8 p-6 bg-white border-2 border-amber-200 rounded-[2.5rem] shadow-xl animate-[fadeInDown_0.3s_ease-out]">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-stone-800 uppercase tracking-widest flex items-center gap-2">
                          <i className="fas fa-seedling text-amber-500"></i> Selecione a Cultura para Plantar
                        </h3>
                        <button onClick={() => setShowAutoPlantMenu(false)} className="text-stone-300 hover:text-stone-500">
                           <i className="fas fa-times-circle text-xl"></i>
                        </button>
                      </div>
                      <div className="flex-wrap gap-3 flex">
                        {availableSeedsForAuto.length === 0 ? (
                          <div className="w-full text-center py-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                             <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Sem sementes no armazém</p>
                          </div>
                        ) : (
                          availableSeedsForAuto.map(type => (
                            <button
                              key={type}
                              onClick={() => handleAutoPlant(type)}
                              className="group flex flex-col items-center bg-stone-50 border border-stone-100 p-4 rounded-3xl hover:bg-amber-50 hover:border-amber-200 transition-all min-w-[100px]"
                            >
                              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{CROPS[type].icon}</span>
                              <span className="text-[10px] font-black text-stone-800 uppercase mb-1">{type}</span>
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                {state.seedInventory[type]} un
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Menu de Colheita Automática */}
                  {showAutoHarvestMenu && (
                    <div className="mb-8 p-6 bg-white border-2 border-green-200 rounded-[2.5rem] shadow-xl animate-[fadeInDown_0.3s_ease-out]">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-stone-800 uppercase tracking-widest flex items-center gap-2">
                          <i className="fas fa-tractor text-green-500"></i> Selecione a Cultura para Colher
                        </h3>
                        <button onClick={() => setShowAutoHarvestMenu(false)} className="text-stone-300 hover:text-stone-500">
                           <i className="fas fa-times-circle text-xl"></i>
                        </button>
                      </div>
                      <div className="flex-wrap gap-3 flex">
                        {readyToHarvestCrops.length === 0 ? (
                          <div className="w-full text-center py-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                             <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Nada pronto para colher no momento</p>
                          </div>
                        ) : (
                          readyToHarvestCrops.map(type => {
                            const count = state.plots.filter(p => p.crop === type && p.isHarvestable).length;
                            const stock = state.inventory[type] || 0;
                            const isFull = stock >= siloCapacityPerCrop;
                            
                            return (
                              <button
                                key={type}
                                disabled={isFull}
                                onClick={() => handleAutoHarvest(type)}
                                className={`group flex flex-col items-center bg-stone-50 border p-4 rounded-3xl transition-all min-w-[100px]
                                  ${isFull ? 'opacity-50 grayscale cursor-not-allowed border-red-200' : 'border-stone-100 hover:bg-green-50 hover:border-green-200'}`}
                              >
                                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{CROPS[type].icon}</span>
                                <span className="text-[10px] font-black text-stone-800 uppercase mb-1">{type}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isFull ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                                  {isFull ? 'Silo Cheio' : `${count} pronto(s)`}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                      <p className="mt-4 text-[9px] text-stone-400 font-medium italic text-center">
                        Isso recolherá os lotes da cultura selecionada, respeitando a capacidade de {siloCapacityPerCrop} do seu silo.
                      </p>
                    </div>
                  )}
                  
                  <div className="farm-grid">
                    {state.plots.map(plot => (
                      <FarmPlotComponent 
                        key={plot.id} 
                        plot={plot} 
                        playerLevel={state.level}
                        seedInventory={state.seedInventory}
                        efficiencyMultiplier={efficiencyMultiplier}
                        siloCapacity={siloCapacityPerCrop}
                        currentCropStock={plot.crop ? state.inventory[plot.crop] || 0 : 0}
                        onPlant={(crop) => handlePlant(plot.id, crop)}
                        onHarvest={(e) => handleHarvest(plot.id, e)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'mercado' && <Marketplace state={state} onBuySeeds={handleBuySeeds} />}
              {activeTab === 'imobiliaria' && <FarmShop state={state} onBuy={handleBuyFarm} />}
              {activeTab === 'noticias' && <FarmNews news={state.news} />}
              {activeTab === 'gestao' && (
                <div className="max-w-4xl mx-auto space-y-12 pb-10">
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-black text-stone-800 tracking-tight">Painel Executivo</h2>
                        <p className="text-stone-500">Métricas consolidadas de desempenho e crescimento.</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
                        <i className="fas fa-clock"></i> Atualizado agora
                      </div>
                    </div>
                    <EvolutionCharts history={state.evolutionHistory} />
                  </section>

                  {/* Sistemas de Automação */}
                  <section className="bg-amber-50 p-8 rounded-[2rem] shadow-sm border border-amber-200">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-amber-900">
                       <i className="fas fa-bolt text-amber-500"></i> Sistemas de Automação
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${state.autoPlantUnlocked ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            <i className="fas fa-seedling text-xl"></i>
                          </div>
                          <div>
                            <h3 className="font-bold text-stone-800">Plantio em Massa</h3>
                            <p className="text-xs text-stone-500">{state.autoPlantUnlocked ? 'Tecnologia Adquirida' : 'Módulo Bloqueado'}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 mb-4 leading-relaxed">Permite preencher todos os lotes vazios com uma única cultura, agilizando drasticamente sua operação.</p>
                        {!state.autoPlantUnlocked ? (
                          <button 
                            onClick={() => {
                              const cost = 8999;
                              if (state.money >= cost) {
                                addTransaction('expense', cost, 'Desbloqueio: Plantio Automático', 'Tecnologia');
                                setState(prev => ({ ...prev, money: prev.money - cost, autoPlantUnlocked: true }));
                                addNews('unlock', 'Automação Liberada!', 'Você agora pode plantar em massa.', '⚡');
                              }
                            }}
                            className={`w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${state.money >= 8999 ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-stone-200 text-stone-400'}`}
                          >
                            Comprar (R$ 8.999)
                          </button>
                        ) : (
                          <div className="w-full py-3 bg-green-50 text-green-600 text-center rounded-xl font-black text-[11px] uppercase tracking-widest border border-green-200">
                             ATIVADO
                          </div>
                        )}
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${state.autoHarvestUnlocked ? 'bg-green-100 text-green-600' : 'bg-green-50 text-green-600'}`}>
                            <i className="fas fa-tractor text-xl"></i>
                          </div>
                          <div>
                            <h3 className="font-bold text-stone-800">Colheita em Massa</h3>
                            <p className="text-xs text-stone-500">{state.autoHarvestUnlocked ? 'Tecnologia Adquirida' : 'Módulo Bloqueado'}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 mb-4 leading-relaxed">Recolhe instantaneamente todas as plantas de uma cultura prontas para colher e as envia para o silo.</p>
                        {!state.autoHarvestUnlocked ? (
                          <button 
                            onClick={() => {
                              const cost = 7999;
                              if (state.money >= cost) {
                                addTransaction('expense', cost, 'Desbloqueio: Colheita Automática', 'Tecnologia');
                                setState(prev => ({ ...prev, money: prev.money - cost, autoHarvestUnlocked: true }));
                                addNews('unlock', 'Colheita Rápida!', 'O sistema de colheita em massa está ativo.', '🚜');
                              }
                            }}
                            className={`w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${state.money >= 7999 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-stone-200 text-stone-400'}`}
                          >
                            Comprar (R$ 7.999)
                          </button>
                        ) : (
                          <div className="w-full py-3 bg-green-50 text-green-600 text-center rounded-xl font-black text-[11px] uppercase tracking-widest border border-green-200">
                             ATIVADO
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-stone-800">
                       <i className="fas fa-microchip text-blue-600"></i> Eficiência e Upgrades
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Bônus de Venda</span>
                        <div className="text-3xl font-black text-green-600">+{state.staffCount * 2}%</div>
                        <p className="text-xs text-stone-500 mt-2">Garantido por sua equipe de campo qualificada.</p>
                      </div>
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Aceleração de Plantio</span>
                        <div className="text-3xl font-black text-blue-600">-{Math.round((1 - efficiencyMultiplier) * 100)}% Tempo</div>
                        <p className="text-xs text-stone-500 mt-2">Proporcionado pelo maquinário de última geração.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <i className="fas fa-users text-xl"></i>
                          </div>
                          <div>
                            <h3 className="font-bold">Equipe de Campo</h3>
                            <p className="text-sm text-stone-500">{state.staffCount} Especialistas</p>
                          </div>
                        </div>
                        <p className="text-xs text-stone-400 mb-4 italic">Cada funcionário melhora o tratamento das colheitas, aumentando o preço de venda em 2%.</p>
                        <button 
                          onClick={() => {
                            const cost = 1500 * state.staffCount;
                            if(state.money >= cost) {
                              addTransaction('expense', cost, 'Contratação de Funcionário', 'Gestão');
                              setState(prev => ({...prev, money: prev.money - cost, staffCount: prev.staffCount+1}));
                            }
                          }}
                          className="w-full py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                        >
                          Contratar (R$ {(1500 * state.staffCount).toLocaleString()})
                        </button>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-amber-200 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <i className="fas fa-tractor text-xl"></i>
                          </div>
                          <div>
                            <h3 className="font-bold">Maquinário</h3>
                            <p className="text-sm text-stone-500">{state.machineryCount} Máquinas</p>
                          </div>
                        </div>
                        <p className="text-xs text-stone-400 mb-4 italic">Tratores otimizam o preparo do solo e semeadura, reduzindo o tempo de crescimento em 5%.</p>
                        <button 
                          onClick={() => {
                            const cost = 5000 * (state.machineryCount + 1);
                            if(state.money >= cost) {
                              addTransaction('expense', cost, 'Compra de Maquinário', 'Tecnologia');
                              setState(prev => ({...prev, money: prev.money - cost, machineryCount: prev.machineryCount+1}));
                            }
                          }}
                          className="w-full py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                        >
                          Comprar (R$ {(5000 * (state.machineryCount + 1)).toLocaleString()})
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl border border-stone-800">
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                       <i className="fas fa-cloud-arrow-down text-blue-400"></i> Central de Backup & Segurança
                    </h2>
                    <p className="text-stone-400 text-sm mb-8 leading-relaxed">
                      Salve o estado da sua fazenda em um arquivo local para não perder seu progresso. Você pode carregar esse arquivo em qualquer outro dispositivo para continuar de onde parou.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex flex-col sm:flex-row">
                      <button 
                        onClick={exportGameState}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                      >
                        <i className="fas fa-file-export"></i> EXPORTAR FAZENDA (.JSON)
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-stone-800 hover:bg-stone-700 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-stone-700"
                      >
                        <i className="fas fa-file-import"></i> IMPORTAR BACKUP
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={importGameState} 
                        accept=".json" 
                        className="hidden" 
                      />
                    </div>
                    <div className="mt-8 pt-6 border-t border-stone-800 text-[10px] text-stone-500 font-bold uppercase tracking-widest text-center">
                      Os arquivos são salvos localmente e não em nossos servidores.
                    </div>
                  </section>
                </div>
              )}
              {activeTab === 'ia' && <AIAdvisor state={state} />}
            </>
          )}
        </div>
        
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {effects.map(effect => (
            <div 
              key={effect.id}
              className={`absolute flex flex-col items-center justify-center ${effect.type === 'fly' ? 'animate-fly-to-bag' : 'animate-float-up'}`}
              style={{ 
                left: effect.x, 
                top: effect.y,
                ['--tw-target-x' as any]: `${window.innerWidth - effect.x - 100}px`,
                ['--tw-target-y' as any]: `${-effect.y + 20}px`
              } as React.CSSProperties}
            >
              {effect.icon && <span className="text-4xl drop-shadow-lg">{effect.icon}</span>}
              {effect.text && (
                <span className="text-lg font-black text-green-600 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)] whitespace-nowrap">
                  {effect.text}
                </span>
              )}
            </div>
          ))}
        </div>
        {showHistoryModal && <FinancialHistoryModal history={state.financialHistory} onClose={() => setShowHistoryModal(false)} />}
        {showWarehouseModal && (
          <WarehouseModal 
            inventory={state.inventory} 
            seedInventory={state.seedInventory}
            marketTrend={state.marketTrend} 
            staffCount={state.staffCount} 
            capacityPerCrop={siloCapacityPerCrop}
            onSellAll={handleSellAll} 
            onSellCrop={handleSellCrop} 
            onClose={() => setShowWarehouseModal(false)} 
            onGoToMarket={() => setActiveTab('mercado')}
          />
        )}
      </main>
    </div>
  );
};

export default App;
