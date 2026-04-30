export interface Person {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  bloodType?: string;
  nationality?: string;
  education?: string;
  occupation?: string;
  address?: string;
  photoPath?: string;
  fatherId?: string;    // 父亲ID
  motherId?: string;    // 母亲ID
  spouseIds?: string[]; // 配偶ID列表（支持多配偶）
  generation?: number;
  notes?: string;
}

export interface Partnership {
  id: string;
  partner1Id: string;
  partner2Id: string;
  startDate?: string;
  endDate?: string;
  status: 'married' | 'divorced' | 'widowed' | 'separated';
  notes?: string;
}

export interface TreeNode {
  person: Person;
  spouses: Person[];    // 多个配偶
  daughters: Person[];  // 女儿
  sonsInLaw: Person[];  // 女婿
  children: TreeNode[];
  x: number;
  y: number;
  generation: number;
}

export type TreeDirection = 'horizontal' | 'vertical';

export interface SearchFilters {
  name?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
  deathDateFrom?: string;
  deathDateTo?: string;
  occupation?: string;
  address?: string;
  nationality?: string;
  education?: string;
  bloodType?: string;
}

export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  direction: TreeDirection;
  showSpouses: boolean;
  showDaughters: boolean;
  showSonsInLaw: boolean;
}
