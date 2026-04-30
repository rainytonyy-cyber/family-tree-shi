// 本地JSON存储 - 作为TerminusDB的备选方案
// 当TerminusDB不可用时使用本地文件存储

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const DB_FILE = join(DATA_DIR, 'family-tree-db.json');

export interface FamilyTreeDB {
  persons: any[];
  partnerships: any[];
  parentChilds: any[];
}

function getDB(): FamilyTreeDB {
  if (existsSync(DB_FILE)) {
    const data = readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return { persons: [], partnerships: [], parentChilds: [] };
}

function saveDB(db: FamilyTreeDB): void {
  if (!existsSync(DATA_DIR)) {
    require('fs').mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Person CRUD
export async function getPersons(): Promise<any[]> {
  const db = getDB();
  return db.persons;
}

export async function getPerson(id: string): Promise<any | null> {
  const db = getDB();
  return db.persons.find(p => p['@id'] === id) || null;
}

export async function createPerson(person: any): Promise<any> {
  const db = getDB();
  const existing = db.persons.find(p => p['@id'] === person['@id']);
  if (existing) {
    throw new Error(`Person ${person['@id']} already exists`);
  }
  db.persons.push(person);
  saveDB(db);
  return person;
}

export async function updatePerson(person: any): Promise<any> {
  const db = getDB();
  const index = db.persons.findIndex(p => p['@id'] === person['@id']);
  if (index === -1) {
    throw new Error(`Person ${person['@id']} not found`);
  }
  db.persons[index] = person;
  saveDB(db);
  return person;
}

export async function deletePerson(id: string): Promise<void> {
  const db = getDB();
  db.persons = db.persons.filter(p => p['@id'] !== id);
  // 同时删除相关的关系
  db.partnerships = db.partnerships.filter(
    p => p.partner1['@id'] !== id && p.partner2['@id'] !== id
  );
  db.parentChilds = db.parentChilds.filter(
    pc => pc.parent['@id'] !== id && pc.child['@id'] !== id
  );
  saveDB(db);
}

// Partnership CRUD
export async function getPartnerships(): Promise<any[]> {
  const db = getDB();
  return db.partnerships;
}

export async function createPartnership(partnership: any): Promise<any> {
  const db = getDB();
  db.partnerships.push(partnership);
  saveDB(db);
  return partnership;
}

export async function deletePartnership(id: string): Promise<void> {
  const db = getDB();
  db.partnerships = db.partnerships.filter(p => p['@id'] !== id);
  saveDB(db);
}

// ParentChild CRUD
export async function getParentChilds(): Promise<any[]> {
  const db = getDB();
  return db.parentChilds;
}

export async function createParentChild(parentChild: any): Promise<any> {
  const db = getDB();
  db.parentChilds.push(parentChild);
  saveDB(db);
  return parentChild;
}

export async function deleteParentChild(id: string): Promise<void> {
  const db = getDB();
  db.parentChilds = db.parentChilds.filter(pc => pc['@id'] !== id);
  saveDB(db);
}

// 复合查询
export async function getFullFamilyTree(): Promise<FamilyTreeDB> {
  return getDB();
}

export async function getPersonWithRelations(personId: string): Promise<any | null> {
  const db = getDB();
  const person = db.persons.find(p => p['@id'] === personId);
  if (!person) return null;

  const spouseRelations = db.partnerships.filter(
    p => p.partner1['@id'] === personId || p.partner2['@id'] === personId
  );

  const parentRelations = db.parentChilds.filter(
    pc => pc.parent['@id'] === personId
  );

  const childRelations = db.parentChilds.filter(
    pc => pc.child['@id'] === personId
  );

  return {
    ...person,
    spouses: spouseRelations.map(p => 
      p.partner1['@id'] === personId ? p.partner2['@id'] : p.partner1['@id']
    ),
    children: parentRelations.map(pc => pc.child['@id']),
    parents: childRelations.map(pc => pc.parent['@id']),
  };
}

// Git式操作（模拟）
export async function getBranches(): Promise<string[]> {
  return ['main'];
}

export async function getCommitHistory(): Promise<any[]> {
  return [
    {
      id: 'initial',
      message: 'Initial commit',
      timestamp: new Date().toISOString()
    }
  ];
}
