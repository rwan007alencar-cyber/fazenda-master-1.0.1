
import { CropType, CropData, FarmTier, GameState } from './types';

export const CROPS: Record<CropType, CropData> = {
  [CropType.SPINACH]: {
    type: CropType.SPINACH,
    growthTime: 15,
    cost: 20,
    salePrice: 55,
    icon: '🥬',
    unlockLevel: 1
  },
  [CropType.WHEAT]: {
    type: CropType.WHEAT,
    growthTime: 30,
    cost: 50,
    salePrice: 130,
    icon: '🌾',
    unlockLevel: 2
  },
  [CropType.PEA]: {
    type: CropType.PEA,
    growthTime: 45,
    cost: 70,
    salePrice: 190,
    icon: '🫛',
    unlockLevel: 3
  },
  [CropType.CORN]: {
    type: CropType.CORN,
    growthTime: 60,
    cost: 110,
    salePrice: 300,
    icon: '🌽',
    unlockLevel: 5
  },
  [CropType.GREEN_BEAN]: {
    type: CropType.GREEN_BEAN,
    growthTime: 80,
    cost: 140,
    salePrice: 420,
    icon: '🫘',
    unlockLevel: 7
  },
  [CropType.RICE]: {
    type: CropType.RICE,
    growthTime: 100,
    cost: 180,
    salePrice: 550,
    icon: '🍚',
    unlockLevel: 10
  },
  [CropType.SOY]: {
    type: CropType.SOY,
    growthTime: 120,
    cost: 220,
    salePrice: 700,
    icon: '🌿',
    unlockLevel: 12
  },
  [CropType.TOMATO]: {
    type: CropType.TOMATO,
    growthTime: 180,
    cost: 350,
    salePrice: 1100,
    icon: '🍅',
    unlockLevel: 15
  },
  [CropType.POTATO]: {
    type: CropType.POTATO,
    growthTime: 240,
    cost: 500,
    salePrice: 1650,
    icon: '🥔',
    unlockLevel: 18
  },
  [CropType.SUNFLOWER]: {
    type: CropType.SUNFLOWER,
    growthTime: 300,
    cost: 650,
    salePrice: 2200,
    icon: '🌻',
    unlockLevel: 22
  },
  [CropType.COTTON]: {
    type: CropType.COTTON,
    growthTime: 400,
    cost: 900,
    salePrice: 3200,
    icon: '☁️',
    unlockLevel: 26
  },
  [CropType.GRAPE]: {
    type: CropType.GRAPE,
    growthTime: 500,
    cost: 1200,
    salePrice: 4500,
    icon: '🍇',
    unlockLevel: 30
  },
  [CropType.OLIVE]: {
    type: CropType.OLIVE,
    growthTime: 600,
    cost: 1800,
    salePrice: 7200,
    icon: '🫒',
    unlockLevel: 35
  }
};

export const FARM_TIERS: FarmTier[] = [
  {
    id: 'sitio',
    name: 'Sítio Recanto',
    price: 150000,
    plotCount: 8,
    description: 'Pequena propriedade ideal para hortaliças e início de carreira. Charme rural e solo fértil.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'fazenda_media',
    name: 'Fazenda Alvorada',
    price: 450000,
    plotCount: 16,
    description: 'Terras férteis com infraestrutura básica para grãos em escala. Foco em soja e milho.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'estancia',
    name: 'Estância Progresso',
    price: 1200000,
    plotCount: 32,
    description: 'Propriedade profissional com silos e grande área arável. Tecnologia de ponta no campo.',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'agro_ceo',
    name: 'Agro-Complexo CEO',
    price: 5000000,
    plotCount: 64,
    description: 'O ápice tecnológico e territorial. Sistemas de irrigação central e produção massiva.',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80'
  }
];

export const INITIAL_STATE: GameState = {
  money: 150000, // Saldo inicial ajustado para 150k
  level: 1,
  xp: 0,
  plots: [],
  inventory: {},
  seedInventory: {
    [CropType.SPINACH]: 10 // Sementes iniciais de cortesia
  },
  staffCount: 1,
  machineryCount: 0,
  autoPlantUnlocked: false, // Começa bloqueado
  autoHarvestUnlocked: false, // Começa bloqueado
  ownedFarmId: null,
  news: [
    {
      id: 'welcome',
      type: 'market',
      title: 'Bem-vindo ao Campo!',
      message: 'Você recebeu 10 sementes de Espinafre para começar. Compre mais no Mercado!',
      timestamp: Date.now(),
      icon: '🌱'
    }
  ],
  financialHistory: [],
  evolutionHistory: []
};

export const XP_PER_LEVEL = 500;
