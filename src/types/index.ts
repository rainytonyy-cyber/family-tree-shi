export interface Person {
  id: string;
  surname: string;          // 姓
  givenName: string;        // 名
  previousNames?: string[]; // 曾用名（支持多个）
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

// 获取完整姓名
export function getFullName(person: Person): string {
  return `${person.surname}${person.givenName}`;
}

// 获取显示名称（包含曾用名）
export function getDisplayName(person: Person): string {
  const fullName = getFullName(person);
  if (person.previousNames && person.previousNames.length > 0) {
    return `${fullName}（曾用名：${person.previousNames.join('、')}）`;
  }
  return fullName;
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
  spouses: Person[];       // 多个配偶（主线人物的配偶，包括儿子的配偶）
  daughters: Person[];     // 女儿
  sonsInLaw: Person[];     // 女婿（女儿的配偶）
  cousins: Person[];       // 表亲（女儿的孩子）
  children: TreeNode[];    // 主线儿子（作为子节点）
  hasChildren: boolean;    // 是否有子节点（不考虑展开状态）
  isExpanded: boolean;     // 是否展开子节点
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
  showSpouses: boolean;      // 显示配偶（包括儿媳）
  showDaughters: boolean;    // 显示女儿
  showSonsInLaw: boolean;    // 显示女婿
  showCousins: boolean;      // 显示表亲（女儿的孩子）
}
