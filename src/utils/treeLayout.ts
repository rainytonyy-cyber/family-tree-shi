import type { Person, TreeNode, TreeDirection } from '../types';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 60;

export function buildTree(persons: Person[]): TreeNode[] {
  const personMap = new Map<string, Person>();
  persons.forEach(p => personMap.set(p.id, p));

  const childMap = new Map<string, Person[]>();
  persons.forEach(p => {
    if (p.parentId && personMap.has(p.parentId)) {
      const children = childMap.get(p.parentId) || [];
      children.push(p);
      childMap.set(p.parentId, children);
    }
  });

  const roots: Person[] = [];
  persons.forEach(p => {
    if (!p.parentId || !personMap.has(p.parentId)) {
      roots.push(p);
    }
  });

  function buildNode(person: Person): TreeNode {
    const children = (childMap.get(person.id) || []).map(buildNode);
    return { person, children, x: 0, y: 0 };
  }

  return roots.map(buildNode);
}

function getSubtreeWidth(node: TreeNode): number {
  if (node.children.length === 0) {
    return NODE_WIDTH;
  }

  const childrenWidth = node.children.reduce(
    (sum, child) => sum + getSubtreeWidth(child) + HORIZONTAL_GAP,
    -HORIZONTAL_GAP
  );

  return Math.max(NODE_WIDTH, childrenWidth);
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
    layoutHorizontal(child, childX + childWidth / 2, y + NODE_HEIGHT + VERTICAL_GAP);
    childX += childWidth + HORIZONTAL_GAP;
  });
}

function layoutVertical(node: TreeNode, x: number, y: number): void {
  node.x = x;
  node.y = y;

  if (node.children.length === 0) return;

  node.children.forEach((child, index) => {
    layoutVertical(child, x + NODE_WIDTH + HORIZONTAL_GAP, y + index * (NODE_HEIGHT + VERTICAL_GAP));
  });
}

export function layoutTree(roots: TreeNode[], direction: TreeDirection): TreeNode[] {
  roots.forEach(root => {
    if (direction === 'horizontal') {
      layoutHorizontal(root, 0, 0);
    } else {
      layoutVertical(root, 0, 0);
    }
  });

  return roots;
}

export function getTreeBounds(roots: TreeNode[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  function visit(node: TreeNode) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + NODE_WIDTH);
    maxY = Math.max(maxY, node.y + NODE_HEIGHT);
    node.children.forEach(visit);
  }

  roots.forEach(visit);
  return { minX, minY, maxX, maxY };
}

export { NODE_WIDTH, NODE_HEIGHT };
