import { useState, useCallback, useMemo } from 'react';
import type { Person, SearchFilters, TreeDirection } from './types';
import { buildTree } from './utils/treeLayout';
import { searchPersons } from './utils/search';
import { TreeView } from './components/TreeView/TreeView';
import { SearchPanel } from './components/SearchPanel/SearchPanel';
import { PersonCard } from './components/PersonCard/PersonCard';
import { DataControls } from './components/DataControls/DataControls';

const SAMPLE_DATA: Person[] = [
  { id: '1', name: '张三', gender: 'male', birthDate: '1950-01-15', occupation: '工程师', nationality: '汉族', bloodType: 'A' },
  { id: '2', name: '李四', gender: 'female', birthDate: '1952-03-20', occupation: '教师', nationality: '汉族', bloodType: 'B', spouseId: '1' },
  { id: '3', name: '张明', gender: 'male', birthDate: '1975-06-10', parentId: '1', occupation: '医生', nationality: '汉族', bloodType: 'A' },
  { id: '4', name: '王芳', gender: 'female', birthDate: '1978-09-25', parentId: '1', occupation: '律师', nationality: '汉族', bloodType: 'O', spouseId: '3' },
  { id: '5', name: '张小明', gender: 'male', birthDate: '2000-12-05', parentId: '3', occupation: '学生', nationality: '汉族', bloodType: 'A' },
  { id: '6', name: '张小红', gender: 'female', birthDate: '2003-04-18', parentId: '3', occupation: '学生', nationality: '汉族', bloodType: 'B' },
];

function App() {
  const [persons, setPersons] = useState<Person[]>(SAMPLE_DATA);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [direction, setDirection] = useState<TreeDirection>('horizontal');
  const [showSearch, setShowSearch] = useState(false);
  const [showPersonCard, setShowPersonCard] = useState(false);

  const highlightedIds = useMemo(
    () => searchResults.map(p => p.id),
    [searchResults]
  );

  const selectedPerson = useMemo(
    () => persons.find(p => p.id === selectedId),
    [persons, selectedId]
  );

  const treeRoots = useMemo(
    () => buildTree(persons),
    [persons]
  );

  const handleSearch = useCallback((filters: SearchFilters) => {
    const results = searchPersons(persons, filters);
    setSearchResults(results);
    if (results.length > 0) {
      setSelectedId(results[0].id);
      setShowPersonCard(true);
    }
  }, [persons]);

  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  const handleSelectPerson = useCallback((id: string) => {
    setSelectedId(id);
    setShowPersonCard(true);
  }, []);

  const handleImport = useCallback((imported: Person[]) => {
    setPersons(imported);
    setSelectedId(undefined);
    setSearchResults([]);
  }, []);

  const handleAddPerson = useCallback(() => {
    const newPerson: Person = {
      id: String(Date.now()),
      name: '新成员',
      gender: 'male',
      birthDate: new Date().toISOString().split('T')[0],
    };
    setPersons(prev => [...prev, newPerson]);
    setSelectedId(newPerson.id);
    setShowPersonCard(true);
  }, []);

  const handleEditPerson = useCallback((updated: Person) => {
    setPersons(prev => prev.map(p => p.id === updated.id ? updated : p));
  }, []);

  const handleDeletePerson = useCallback((id: string) => {
    if (!confirm('确定要删除此人员吗？')) return;
    setPersons(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) {
      setSelectedId(undefined);
      setShowPersonCard(false);
    }
  }, [selectedId]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">家谱管理系统</h1>
        <div className="flex items-center gap-4">
          <DataControls
            persons={persons}
            onImport={handleImport}
            onAddPerson={handleAddPerson}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">方向:</span>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value as TreeDirection)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="horizontal">水平</option>
              <option value="vertical">垂直</option>
            </select>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`px-4 py-2 rounded-md ${
              showSearch
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            搜索
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <TreeView
          roots={treeRoots}
          direction={direction}
          selectedId={selectedId}
          highlightedIds={highlightedIds}
          onSelectPerson={handleSelectPerson}
        />

        {showSearch && (
          <SearchPanel
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        )}

        {showPersonCard && selectedPerson && (
          <PersonCard
            person={selectedPerson}
            allPersons={persons}
            onClose={() => setShowPersonCard(false)}
            onEdit={handleEditPerson}
            onDelete={handleDeletePerson}
          />
        )}
      </main>
    </div>
  );
}

export default App;
