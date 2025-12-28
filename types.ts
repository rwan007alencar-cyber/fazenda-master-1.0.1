
export enum CropType {
  WHEAT = 'Trigo',
  CORN = 'Milho',
  SOY = 'Soja',
  SUNFLOWER = 'Girassol',
  TOMATO = 'Tomate',
  RICE = 'Arroz',
  SPINACH = 'Espinafre',
  PEA = 'Ervilha',
  GREEN_BEAN = 'Feijão-vagem',
  POTATO = 'Batata',
  GRAPE = 'Uva',
  OLIVE = 'Oliva',
  COTTON = 'Algodão'
}

export interface CropData {
  type: CropType;
  growthTime: number; // em segundos
  cost: number;
  salePrice: number;
  icon: string;
  unlockLevel: number; // Nível necessário para plantar
}

export interface FarmPlot {
  id: number;
  crop?: CropType;
  plantedAt?: number; // timestamp
  isHarvestable: boolean;
}

export interface FarmTier {
  id: string;
  name: string;
  price: number;
  plotCount: number;
  description: string;
  image: string;
}

export interface NewsItem {
  id: string;
  type: 'harvest' | 'unlock' | 'market' | 'levelUp';
  title: string;
  message: string;
  timestamp: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  timestamp: number;
  category: string;
}

export interface ProgressSnapshot {
  timestamp: number;
  money: number;
  xpTotal: number;
  level: number;
}

export interface GameState {
  money: number;
  level: number;
  xp: number;
  plots: FarmPlot[];
  inventory: Record<string, number>; // Produtos colhidos
  seedInventory: Record<string, number>; // Sementes disponíveis
  staffCount: number;
  machineryCount: number;
  autoPlantUnlocked: boolean; // NOVO: Trava de plantio automático
  autoHarvestUnlocked: boolean; // NOVO: Trava de colheita automática
  ownedFarmId: string | null;
  news: NewsItem[];
  financialHistory: Transaction[];
  evolutionHistory: ProgressSnapshot[];
  marketTrend?: {
    crop: CropType;
    multiplier: number;
  };
}

export interface MarketTrend {
  crop: CropType;
  multiplier: number;
  description: string;
}
