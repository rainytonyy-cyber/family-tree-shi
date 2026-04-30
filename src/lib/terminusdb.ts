// TerminusDB API 封装层
// src/lib/terminusdb.ts

const TERMINUS_URL = 'http://localhost:6363';
const DB_NAME = 'family-tree';
const AUTH = 'Basic ' + btoa('admin:admin');

interface TerminusResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class TerminusDBClient {
  private baseUrl: string;
  private dbName: string;
  private auth: string;

  constructor() {
    this.baseUrl = TERMINUS_URL;
    this.dbName = DB_NAME;
    this.auth = AUTH;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<TerminusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.auth,
          ...options.headers,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // ========== Person CRUD ==========

  async getPersons(): Promise<any[]> {
    const result = await this.request(`/api/document/admin/${this.dbName}/local/commit?graph_type=instance&type=Person`);
    return result.success ? result.data : [];
  }

  async getPerson(id: string): Promise<any | null> {
    const result = await this.request(`/api/document/admin/${this.dbName}/local/commit?id=${id}&graph_type=instance`);
    return result.success ? result.data : null;
  }

  async createPerson(person: any): Promise<TerminusResponse> {
    return this.request(
      `/api/document/admin/${this.dbName}/local/commit?author=admin&message=Create person ${person['@id']}`,
      { method: 'POST', body: JSON.stringify(person) }
    );
  }

  async updatePerson(person: any): Promise<TerminusResponse> {
    return this.request(
      `/api/document/admin/${this.dbName}/local/commit?author=admin&message=Update person ${person['@id']}`,
      { method: 'PUT', body: JSON.stringify(person) }
    );
  }

  async deletePerson(id: string): Promise<TerminusResponse> {
    return this.request(
      `/api/document/admin/${this.dbName}/local/commit?author=admin&message=Delete person ${id}&id=${id}`,
      { method: 'DELETE' }
    );
  }

  // ========== Partnership CRUD ==========

  async getPartnerships(): Promise<any[]> {
    const result = await this.request(`/api/document/admin/${this.dbName}/local/commit?graph_type=instance&type=Partnership`);
    return result.success ? result.data : [];
  }

  async createPartnership(partnership: any): Promise<TerminusResponse> {
    return this.request(
      `/api/document/admin/${this.dbName}/local/commit?author=admin&message=Create partnership ${partnership['@id']}`,
      { method: 'POST', body: JSON.stringify(partnership) }
    );
  }

  async deletePartnership(id: string): Promise<TerminusResponse> {
    return this.request(
      `/api/document/admin/${this.dbName}/local/commit?author=admin&message=Delete partnership ${id}&id=${id}`,
      { method: 'DELETE' }
    );
  }

  // ========== ParentChild CRUD ==========

  async getParentChildRelations(): Promise<any[]> {
    const result = await this.request(`/api/document/admin/${this.dbName}/local/commit?graph_type=instance&type=ParentChild`);
    return result.success ? result.data : [];
  }

  async createParentChild(parentChild: any): Promise<TerminusResponse> {
    return this.request(
      `/api/document/admin/${this.dbName}/local/commit?author=admin&message=Create parent-child ${parentChild['@id']}`,
      { method: 'POST', body: JSON.stringify(parentChild) }
    );
  }

  async deleteParentChild(id: string): Promise<TerminusResponse> {
    return this.request(
      `/api/document/admin/${this.dbName}/local/commit?author=admin&message=Delete parent-child ${id}&id=${id}`,
      { method: 'DELETE' }
    );
  }

  // ========== 复合查询 ==========

  async getFullFamilyTree(): Promise<{ persons: any[]; partnerships: any[]; parentChilds: any[] }> {
    const [persons, partnerships, parentChilds] = await Promise.all([
      this.getPersons(),
      this.getPartnerships(),
      this.getParentChildRelations(),
    ]);
    return { persons, partnerships, parentChilds };
  }

  async getPersonWithRelations(personId: string): Promise<any | null> {
    const person = await this.getPerson(personId);
    if (!person) return null;

    const partnerships = await this.getPartnerships();
    const parentChilds = await this.getParentChildRelations();

    const spouseRelations = partnerships.filter(
      (p: any) => p.partner1['@id'] === personId || p.partner2['@id'] === personId
    );

    const parentRelations = parentChilds.filter(
      (pc: any) => pc.parent['@id'] === personId
    );

    const childRelations = parentChilds.filter(
      (pc: any) => pc.child['@id'] === personId
    );

    return {
      ...person,
      spouses: spouseRelations.map((p: any) => 
        p.partner1['@id'] === personId ? p.partner2['@id'] : p.partner1['@id']
      ),
      children: parentRelations.map((pc: any) => pc.child['@id']),
      parents: childRelations.map((pc: any) => pc.parent['@id']),
    };
  }

  // ========== Git操作 ==========

  async getBranches(): Promise<any[]> {
    const result = await this.request(`/api/branch/admin/${this.dbName}`);
    return result.success ? result.data : [];
  }

  async createBranch(branchName: string, fromBranch: string = 'main'): Promise<TerminusResponse> {
    return this.request(
      `/api/branch/admin/${this.dbName}`,
      {
        method: 'POST',
        body: JSON.stringify({
          origin: `admin/${this.dbName}/local/commit/${fromBranch}`,
          branch_name: branchName,
        }),
      }
    );
  }

  async getCommitHistory(): Promise<any[]> {
    const result = await this.request(`/api/log/admin/${this.dbName}/local/commit`);
    return result.success ? result.data : [];
  }
}

// 导出单例
export const terminusdb = new TerminusDBClient();
