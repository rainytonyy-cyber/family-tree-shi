import type { Person, TreeNode, TreeDirection } from '../types';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 90;
const SPOUSE_NODE_WIDTH = 140;
const SPOUSE_NODE_HEIGHT = 70;
const HORIZONTAL_GAP = 50;
const VERTICAL_GAP = 80;
const GENERATION_GAP = 120;

export function buildTree(persons: Person[], showSpouses: boolean = true, showFemaleMembers: boolean = true): TreeNode[] {
  const personMap = new Map<string, Person>();
  persons.forEach(p => personMap.set(p.id, p));

  // 构建配偶关系映射（双向）
  const spouseMap = new Map<string, Person>();
  persons.forEach(p => {
    if (p.spouseId) {
      const spouse = personMap.get(p.spouseId);
      if (spouse) {
        // 双向映射
        spouseMap.set(p.id, spouse);
        spouseMap.set(spouse.id, p);
      }
    }
  });

  // 只以男性作为父系分支 - 找出所有有后代的男性或没有parentId的男性
  const maleDescendants = new Set<string>();
  
  // 标记所有有后代的人
  persons.forEach(p => {
    if (p.parentId) {
      maleDescendants.add(p.parentId);
    }
  });

  // 找出根节点 - 只有没有parentId的史姓血缘男性才能作为根节点
  // 排除配偶（有spouseId的人）作为根节点
  const roots: Person[] = [];
  persons.forEach(p => {
    // 条件1: 没有parentId
    // 条件2: 是男性
    // 条件3: 不是配偶（没有spouseId，或者是史姓血缘成员）
    const hasNoParent = !p.parentId || !personMap.has(p.parentId);
    const isMale = p.gender === 'male';
    const isNotSpouse = !p.spouseId; // 配偶有spouseId，不应该作为根节点
    
    if (hasNoParent && isMale && isNotSpouse) {
      roots.push(p);
    }
  });

  // 按辈分排序
  roots.sort((a, b) => (a.generation || 1) - (b.generation || 1));

  function buildNode(person: Person): TreeNode {
    // 找出该人的配偶（通过双向映射）
    const spouse = showSpouses ? spouseMap.get(person.id) : undefined;

    // 找出该人的女性子代（女儿）
    const daughters = showFemaleMembers 
      ? persons.filter(p => p.parentId === person.id && p.gender === 'female')
      : [];

    // 找出该人的男性子代作为分支
    const children = persons
      .filter(p => p.parentId === person.id && p.gender === 'male')
      .sort((a, b) => {
        // 按出生日期排序
        const dateA = a.birthDate || '';
        const dateB = b.birthDate || '';
        return dateA.localeCompare(dateB);
      })
      .map(buildNode);

    return { 
      person, 
      spouse,
      daughters,
      children, 
      x: 0, 
      y: 0,
      generation: person.generation || 1
    };
  }

  return roots.map(buildNode);
}

function getSubtreeWidth(node: TreeNode): number {
  if (node.children.length === 0) {
    return NODE_WIDTH + (node.spouse ? SPOUSE_NODE_WIDTH + 20 : 0);
  }

  const childrenWidth = node.children.reduce(
    (sum, child) => sum + getSubtreeWidth(child) + HORIZONTAL_GAP,
    -HORIZONTAL_GAP
  );

  const nodeWidth = NODE_WIDTH + (node.spouse ? SPOUSE_NODE_WIDTH + 20 : 0);
  return Math.max(nodeWidth, childrenWidth);
}

function layoutHorizontal(node: TreeNode, x: number, y: number): void {
  node.x = x;
  node.y = y;

  if (node.children.length === 0) return;

  const totalWidth = node.children.reduce(
    (sum, child) => sum + getSubtreeWidth(child) + HORIZONTAL_GAP,
    -HORIZONTAL_GAP
  );

  let childX = x - totalWidth / 2;

  node.children.forEach(child => {
    const childWidth = getSubtreeWidth(child);
    layoutHorizontal(child, childX + childWidth / 2, y + NODE_HEIGHT + VERTICAL_GAP + (node.generation || 1) * 10);
    childX += childWidth + HORIZONTAL_GAP;
  });
}

function layoutVertical(node: TreeNode, x: number, y: number): void {
  node.x = x;
  node.y = y;

  if (node.children.length === 0) return;

  node.children.forEach((child, index) => {
    layoutVertical(child, x + NODE_WIDTH + HORIZONTAL_GAP + (node.spouse ? SPOUSE_NODE_WIDTH + 20 : 0), y + index * (NODE_HEIGHT + VERTICAL_GAP));
  });
}

export function layoutTree(roots: TreeNode[], direction: TreeDirection): TreeNode[] {
  // 按辈分分组布局
  const generationGroups = new Map<number, TreeNode[]>();
  
  roots.forEach(root => {
    const gen = root.generation || 1;
    if (!generationGroups.has(gen)) {
      generationGroups.set(gen, []);
    }
    generationGroups.get(gen)!.push(root);
  });

  // 对每个世代组进行布局
  let currentY = 0;
  const sortedGenerations = Array.from(generationGroups.keys()).sort((a, b) => a - b);
  
  sortedGenerations.forEach(gen => {
    const nodes = generationGroups.get(gen)!;
    let currentX = 0;
    
    nodes.forEach(root => {
      if (direction === 'horizontal') {
        layoutHorizontal(root, currentX, currentY);
        currentX += getSubtreeWidth(root) + HORIZONTAL_GAP * 2;
      } else {
        layoutVertical(root, currentX, currentY);
        currentY += (NODE_HEIGHT + VERTICAL_GAP) * 3;
      }
    });
    
    if (direction === 'horizontal') {
      currentY += GENERATION_GAP;
    }
  });

  return roots;
}

export function getTreeBounds(roots: TreeNode[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  function visit(node: TreeNode) {
    const nodeWidth = NODE_WIDTH + (node.spouse ? SPOUSE_NODE_WIDTH + 20 : 0);
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + nodeWidth);
    maxY = Math.max(maxY, node.y + NODE_HEIGHT);
    node.children.forEach(visit);
  }

  roots.forEach(visit);
  return { minX, minY, maxX, maxY };
}

export { NODE_WIDTH, NODE_HEIGHT, SPOUSE_NODE_WIDTH, SPOUSE_NODE_HEIGHT };
