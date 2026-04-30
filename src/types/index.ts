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
  parentId?: string;
  spouseId?: string;
  generation?: number;
  notes?: string;
}

export interface TreeNode {
  person: Person;
  spouse?: Person;
  daughters: Person[];  // 非配偶的女性成员（女儿）
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
  showFemaleMembers: boolean;
}
