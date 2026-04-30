import type { Person, TreeNode, TreeDirection } from '../types';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 90;
const SPOUSE_NODE_WIDTH = 140;
const SPOUSE_NODE_HEIGHT = 70;
const HORIZONTAL_GAP = 50;
const VERTICAL_GAP = 80;
const GENERATION_GAP = 120;

export function buildTree(persons: Person[], showSpouses: boolean = true, showDaughters: boolean = true, showSonsInLaw: boolean = true): TreeNode[] {
  const personMap = new Map<string, Person>();
  persons.forEach(p => personMap.set(p.id, p));

  // 找出根节点 - 没有父亲也没有母亲的人（或者父母都不在数据中）
  const roots: Person[] = [];
  persons.forEach(p => {
    const hasFather = p.fatherId && personMap.has(p.fatherId);
    const hasMother = p.motherId && personMap.has(p.motherId);
    
    // 如果没有父母在数据中，且是男性，则作为根节点
    if (!hasFather && !hasMother && p.gender === 'male') {
      roots.push(p);
    }
  });

  // 按辈分排序
  roots.sort((a, b) => (a.generation || 1) - (b.generation || 1));

  function buildNode(person: Person): TreeNode {
    // 找出该人的所有配偶
    const spouses = showSpouses 
      ? (person.spouseIds || [])
          .map(id => personMap.get(id))
          .filter((p): p is Person => p !== undefined)
      : [];

    // 找出该人的女儿（以该人为父亲）
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

    // 找出该人的儿子作为分支（以该人为父亲）
    const children = persons
      .filter(p => p.fatherId === person.id && p.gender === 'male')
      .sort((a, b) => {
        const dateA = a.birthDate || '';
        const dateB = b.birthDate || '';
        return dateA.localeCompare(dateB);
      })
      .map(buildNode);

    return { 
      person, 
      spouses,
      daughters,
      sonsInLaw,
      children, 
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

  const spouseWidth = node.spouses.length > 0 
    ? node.spouses.length * (SPOUSE_NODE_WIDTH + 10) 
    : 0;

  node.children.forEach((child, index) => {
    layoutVertical(child, x + NODE_WIDTH + HORIZONTAL_GAP + spouseWidth, y + index * (NODE_HEIGHT + VERTICAL_GAP));
  });
}

export function layoutTree(roots: TreeNode[], direction: TreeDirection): TreeNode[] {
  const generationGroups = new Map<number, TreeNode[]>();
  
  roots.forEach(root => {
    const gen = root.generation || 1;
    if (!generationGroups.has(gen)) {
      generationGroups.set(gen, []);
    }
    generationGroups.get(gen)!.push(root);
  });

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
