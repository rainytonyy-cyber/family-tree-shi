import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Person, SearchFilters, TreeDirection } from './types';
import { buildTree } from './utils/treeLayout';
import { searchPersons } from './utils/search';
import { TreeView } from './components/TreeView/TreeView';
import { SearchPanel } from './components/SearchPanel/SearchPanel';
import { PersonCard } from './components/PersonCard/PersonCard';
import { DataControls } from './components/DataControls/DataControls';

const SAMPLE_DATA: Person[] = [
  { id: '1', name: '张三', gender: 'male', birthDate: '1950-01-15', occupation: '工程师', nationality: '汉族', bloodType: 'A', education: '本科' },
  { id: '2', name: '李四', gender: 'female', birthDate: '1952-03-20', occupation: '教师', nationality: '汉族', bloodType: 'B', spouseId: '1', education: '本科' },
  { id: '3', name: '张明', gender: 'male', birthDate: '1975-06-10', parentId: '1', occupation: '医生', nationality: '汉族', bloodType: 'A', education: '硕士' },
  { id: '4', name: '王芳', gender: 'female', birthDate: '1978-09-25', parentId: '1', occupation: '律师', nationality: '汉族', bloodType: 'O', spouseId: '3', education: '本科' },
  { id: '5', name: '张小明', gender: 'male', birthDate: '2000-12-05', parentId: '3', occupation: '学生', nationality: '汉族', bloodType: 'A', education: '在读' },
  { id: '6', name: '张小红', gender: 'female', birthDate: '2003-04-18', parentId: '3', occupation: '学生', nationality: '汉族', bloodType: 'B', education: '在读' },
];

function App() {
  const [persons, setPersons] = useState<Person[]>(SAMPLE_DATA);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [direction, setDirection] = useState<TreeDirection>('horizontal');
  const [showSearch, setShowSearch] = useState(false);
  const [showPersonCard, setShowPersonCard] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  const stats = useMemo(() => {
    const maleCount = persons.filter(p => p.gender === 'male').length;
    const femaleCount = persons.filter(p => p.gender === 'female').length;
    const generations = new Set(persons.map(p => {
      let gen = 0;
      let current = p;
      while (current.parentId) {
        gen++;
        current = persons.find(parent => parent.id === current.parentId) || current;
        if (gen > 100) break;
      }
      return gen;
    })).size;
    return { total: persons.length, male: maleCount, female: femaleCount, generations };
  }, [persons]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            setShowSearch(true);
            break;
          case 'h':
            e.preventDefault();
            setDirection(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
            break;
          case 'i':
            e.preventDefault();
            setShowStats(prev => !prev);
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowPersonCard(false);
        setShowStats(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <div className="h-screen flex flex-col ink-wash-bg">
      {/* 头部 - 水墨风格 */}
      <header 
        className={`
          bg-white/90 backdrop-blur-md border-b border-ink-200 
          px-6 py-4 flex items-center justify-between
          paper-texture
          transition-all duration-500
          ${isLoaded ? 'animate-fade-in' : 'opacity-0'}
        `}
      >
        <div className="flex items-center gap-4 relative z-10">
          {/* Logo - 书法风格 */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-ink-800 to-ink-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-rice-paper text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  家
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-jade-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 
                className="text-2xl font-bold text-ink-900 tracking-wide"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                家谱管理系统
              </h1>
              <p className="text-xs text-ink-500 mt-0.5">Family Tree Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <DataControls
            persons={persons}
            onImport={handleImport}
            onAddPerson={handleAddPerson}
          />
          
          <div className="h-8 w-px bg-ink-200"></div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-500">布局</span>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value as TreeDirection)}
              className="
                px-3 py-2 border border-ink-200 rounded-lg text-sm 
                bg-white hover:border-jade-400 
                focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                transition-all duration-200
              "
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <option value="horizontal">水平</option>
              <option value="vertical">垂直</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className={`
              btn-ink px-4 py-2 rounded-lg text-sm font-medium 
              transition-all duration-300
              ${showStats
                ? 'bg-jade-500 text-white shadow-md shadow-jade-500/20'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }
            `}
          >
            统计
          </button>
          
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`
              btn-ink px-4 py-2 rounded-lg text-sm font-medium 
              transition-all duration-300
              ${showSearch
                ? 'bg-ink-800 text-rice-paper shadow-md shadow-ink-800/20'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }
            `}
          >
            搜索
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 flex overflow-hidden relative">
        <TreeView
          roots={treeRoots}
          direction={direction}
          selectedId={selectedId}
          highlightedIds={highlightedIds}
          onSelectPerson={handleSelectPerson}
        />

        {/* 统计面板 - 水墨卡片风格 */}
        {showStats && (
          <div className="
            absolute top-6 left-6 z-10
            bg-white/95 backdrop-blur-sm 
            rounded-xl shadow-xl shadow-ink-900/10
            border border-ink-200
            p-5 w-56
            animate-fade-in-scale
            paper-texture
          ">
            <h3 
              className="text-sm font-semibold text-ink-800 mb-4 pb-2 border-b border-ink-100"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              家族统计
            </h3>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <div className="text-center p-3 bg-ink-50 rounded-lg hover:bg-ink-100 transition-colors">
                <div className="text-2xl font-bold text-ink-800" style={{ fontFamily: 'var(--font-display)' }}>
                  {stats.total}
                </div>
                <div className="text-xs text-ink-500 mt-1">总人数</div>
              </div>
              <div className="text-center p-3 bg-jade-50 rounded-lg hover:bg-jade-100 transition-colors">
                <div className="text-2xl font-bold text-jade-600" style={{ fontFamily: 'var(--font-display)' }}>
                  {stats.generations}
                </div>
                <div className="text-xs text-ink-500 mt-1">世代数</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'var(--font-display)' }}>
                  {stats.male}
                </div>
                <div className="text-xs text-ink-500 mt-1">男性</div>
              </div>
              <div className="text-center p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                <div className="text-2xl font-bold text-rose-600" style={{ fontFamily: 'var(--font-display)' }}>
                  {stats.female}
                </div>
                <div className="text-xs text-ink-500 mt-1">女性</div>
              </div>
            </div>
          </div>
        )}

        {/* 搜索面板 */}
        {showSearch && (
          <SearchPanel
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        )}

        {/* 人员详情卡片 */}
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

      {/* 底部状态栏 */}
      <footer 
        className={`
          bg-white/80 backdrop-blur-sm border-t border-ink-200 
          px-6 py-2.5 flex items-center justify-between 
          text-xs text-ink-500
          transition-all duration-500 delay-300
          ${isLoaded ? 'animate-fade-in' : 'opacity-0'}
        `}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-jade-500 rounded-full"></span>
            总人数: {stats.total}
          </span>
          <span className="text-ink-300">|</span>
          <span>搜索结果: {searchResults.length}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-400">
          <kbd className="px-1.5 py-0.5 bg-ink-100 rounded text-xs">Ctrl+F</kbd>
          <span>搜索</span>
          <kbd className="px-1.5 py-0.5 bg-ink-100 rounded text-xs ml-2">Ctrl+H</kbd>
          <span>切换布局</span>
          <kbd className="px-1.5 py-0.5 bg-ink-100 rounded text-xs ml-2">Ctrl+I</kbd>
          <span>统计</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
