import type { Person, TreeNode, TreeDirection } from '../types';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 90;
const SPOUSE_NODE_WIDTH = 140;
const SPOUSE_NODE_HEIGHT = 70;
const HORIZONTAL_GAP = 50;

// 基础间距
const BASE_VERTICAL_GAP = 60;
const BASE_GENERATION_GAP = 100;

// 动态间距计算：根据显示选项增加间距
function getVerticalGap(showDaughters: boolean, _showSonsInLaw: boolean, showCousins: boolean): number {
  let gap = BASE_VERTICAL_GAP;
  if (showDaughters) gap += 30;      // 显示女儿时增加间距
  // 女婿和女儿同一行，无需额外增加
  if (showCousins) gap += 50;        // 显示表亲时增加间距
  return gap;
}

function getGenerationGap(showDaughters: boolean, _showSonsInLaw: boolean, showCousins: boolean): number {
  let gap = BASE_GENERATION_GAP;
  if (showDaughters) gap += 40;      // 显示女儿时增加辈分间距
  // 女婿和女儿同一行，无需额外增加
  if (showCousins) gap += 50;        // 显示表亲时增加辈分间距
  return gap;
}

export function buildTree(
  persons: Person[], 
  showSpouses: boolean = true, 
  showDaughters: boolean = true, 
  showSonsInLaw: boolean = true,
  showCousins: boolean = false,
  collapsedNodes: Set<string> = new Set()
): TreeNode[] {
  const personMap = new Map<string, Person>();
  persons.forEach(p => personMap.set(p.id, p));

  // 找出根节点 - 只允许一个根节点
  // 根节点是没有父亲也没有母亲的男性（可以有配偶）
  const potentialRoots: Person[] = [];
  persons.forEach(p => {
    const hasFather = p.fatherId && personMap.has(p.fatherId);
    const hasMother = p.motherId && personMap.has(p.motherId);
    
    // 如果没有父母在数据中，且是男性，则作为潜在根节点（可以有配偶）
    if (!hasFather && !hasMother && p.gender === 'male') {
      potentialRoots.push(p);
    }
  });

  // 按辈分排序，取辈分最低的作为唯一根节点
  potentialRoots.sort((a, b) => (a.generation || 1) - (b.generation || 1));
  const roots: Person[] = potentialRoots.length > 0 ? [potentialRoots[0]] : [];

  function buildNode(person: Person): TreeNode {
    const isExpanded = !collapsedNodes.has(person.id);
    
    // 找出该人的所有配偶（包括儿子的配偶，受showSpouses控制）
    const spouses = showSpouses 
      ? (person.spouseIds || [])
          .map(id => personMap.get(id))
          .filter((p): p is Person => p !== undefined)
      : [];

    // 找出该人的女儿
    const daughters = showDaughters 
      ? persons.filter(p => p.fatherId === person.id && p.gender === 'female')
      : [];

    // 找出女婿（女儿的配偶）
    const sonsInLaw = (showDaughters && showSonsInLaw)
      ? daughters.flatMap(daughter => 
          (daughter.spouseIds || [])
            .map(id => personMap.get(id))
            .filter((p): p is Person => p !== undefined)
        )
      : [];

    // 找出表亲（女儿的孩子）
    const cousins = (showDaughters && showCousins)
      ? persons.filter(p => daughters.some(d => d.id === p.fatherId || d.id === p.motherId))
      : [];

    // 找出该人的儿子作为主线分支（如果展开的话）
    const children = isExpanded
      ? persons
          .filter(p => p.fatherId === person.id && p.gender === 'male')
          .sort((a, b) => {
            const dateA = a.birthDate || '';
            const dateB = b.birthDate || '';
            return dateA.localeCompare(dateB);
          })
          .map(buildNode)
      : [];

    return { 
      person, 
      spouses,
      daughters,
      sonsInLaw,
      cousins,
      children,
      isExpanded,
      x: 0, 
      y: 0,
      generation: person.generation || 1
    };
  }

  return roots.map(buildNode);
}

function getSubtreeWidth(node: TreeNode): number {
  const spouseWidth = node.spouses.length > 0 
    ? node.spouses.length * (SPOUSE_NODE_WIDTH + 10) 
    : 0;

  if (node.children.length === 0) {
    return NODE_WIDTH + spouseWidth;
  }

  const childrenWidth = node.children.reduce(
    (sum, child) => sum + getSubtreeWidth(child) + HORIZONTAL_GAP,
    -HORIZONTAL_GAP
  );

  const nodeWidth = NODE_WIDTH + spouseWidth;
  return Math.max(nodeWidth, childrenWidth);
}

function layoutHorizontal(
  node: TreeNode, 
  x: number, 
  y: number, 
  verticalGap: number
): void {
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
    layoutHorizontal(child, childX + childWidth / 2, y + NODE_HEIGHT + verticalGap, verticalGap);
    childX += childWidth + HORIZONTAL_GAP;
  });
}

function layoutVertical(node: TreeNode, x: number, y: number): void {
  node.x = x;
  node.y = y;

  if (node.children.length === 0) return;

  const spouseWidth = node.spouses.length > 0 
    ? node.spouses.length * (SPOUSE_NODE_WIDTH + 10) 
    : 0;

  node.children.forEach((child, index) => {
    layoutVertical(child, x + NODE_WIDTH + HORIZONTAL_GAP + spouseWidth, y + index * (NODE_HEIGHT + BASE_VERTICAL_GAP));
  });
}

export function layoutTree(
  roots: TreeNode[], 
  direction: TreeDirection,
  showDaughters: boolean = true,
  showSonsInLaw: boolean = true,
  showCousins: boolean = false
): TreeNode[] {
  const generationGroups = new Map<number, TreeNode[]>();
  
  roots.forEach(root => {
    const gen = root.generation || 1;
    if (!generationGroups.has(gen)) {
      generationGroups.set(gen, []);
    }
    generationGroups.get(gen)!.push(root);
  });

  // 计算动态间距
  const verticalGap = getVerticalGap(showDaughters, showSonsInLaw, showCousins);
  const generationGap = getGenerationGap(showDaughters, showSonsInLaw, showCousins);

  let currentY = 0;
  const sortedGenerations = Array.from(generationGroups.keys()).sort((a, b) => a - b);
  
  sortedGenerations.forEach(gen => {
    const nodes = generationGroups.get(gen)!;
    let currentX = 0;
    
    nodes.forEach(root => {
      if (direction === 'horizontal') {
        layoutHorizontal(root, currentX, currentY, verticalGap);
        currentX += getSubtreeWidth(root) + HORIZONTAL_GAP * 2;
      } else {
        layoutVertical(root, currentX, currentY);
        currentY += (NODE_HEIGHT + BASE_VERTICAL_GAP) * 3;
      }
    });
    
    if (direction === 'horizontal') {
      currentY += generationGap;
    }
  });

  return roots;
}

export function getTreeBounds(roots: TreeNode[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  function visit(node: TreeNode) {
    const spouseWidth = node.spouses.length > 0 
      ? node.spouses.length * (SPOUSE_NODE_WIDTH + 10) 
      : 0;
    const nodeWidth = NODE_WIDTH + spouseWidth;

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
