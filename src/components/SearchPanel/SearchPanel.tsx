import { useState } from 'react';
import type { SearchFilters } from '../../types';

interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export function SearchPanel({ onSearch, onClear }: SearchPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  return (
    <div className="
      w-80 bg-white/95 backdrop-blur-sm border-l border-ink-200 
      flex flex-col animate-slide-right
      paper-texture
      shadow-xl shadow-ink-900/5
    ">
      <div className="p-5 border-b border-ink-100 relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 
            className="text-lg font-semibold text-ink-800"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            搜索
          </h2>
          <div className="w-8 h-0.5 bg-gradient-to-r from-jade-500 to-transparent rounded-full"></div>
        </div>

        <div className="space-y-4">
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <label className="block text-xs text-ink-500 mb-1.5 font-medium">姓名</label>
            <input
              type="text"
              value={filters.name || ''}
              onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
              className="
                w-full px-3 py-2.5 border border-ink-200 rounded-lg
                bg-white text-ink-800 text-sm
                placeholder:text-ink-400
                hover:border-jade-400
                focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                transition-all duration-200
              "
              placeholder="输入姓名搜索..."
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <label className="block text-xs text-ink-500 mb-1.5 font-medium">职业</label>
            <input
              type="text"
              value={filters.occupation || ''}
              onChange={e => setFilters(prev => ({ ...prev, occupation: e.target.value }))}
              className="
                w-full px-3 py-2.5 border border-ink-200 rounded-lg
                bg-white text-ink-800 text-sm
                placeholder:text-ink-400
                hover:border-jade-400
                focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                transition-all duration-200
              "
              placeholder="输入职业..."
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <label className="block text-xs text-ink-500 mb-1.5 font-medium">地址</label>
            <input
              type="text"
              value={filters.address || ''}
              onChange={e => setFilters(prev => ({ ...prev, address: e.target.value }))}
              className="
                w-full px-3 py-2.5 border border-ink-200 rounded-lg
                bg-white text-ink-800 text-sm
                placeholder:text-ink-400
                hover:border-jade-400
                focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                transition-all duration-200
              "
              placeholder="输入地址..."
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="
              text-sm text-jade-600 hover:text-jade-700 
              flex items-center gap-1.5
              transition-colors duration-200
            "
          >
            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
              ▸
            </span>
            {isExpanded ? '收起更多条件' : '展开更多条件'}
          </button>

          {isExpanded && (
            <div className="space-y-4 pt-3 border-t border-ink-100 animate-fade-in">
              <div>
                <label className="block text-xs text-ink-500 mb-1.5 font-medium">出生日期范围</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={filters.birthDateFrom || ''}
                    onChange={e => setFilters(prev => ({ ...prev, birthDateFrom: e.target.value }))}
                    className="
                      flex-1 px-3 py-2 border border-ink-200 rounded-lg
                      bg-white text-ink-800 text-sm
                      hover:border-jade-400
                      focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                      transition-all duration-200
                    "
                  />
                  <span className="text-ink-400 text-xs">至</span>
                  <input
                    type="date"
                    value={filters.birthDateTo || ''}
                    onChange={e => setFilters(prev => ({ ...prev, birthDateTo: e.target.value }))}
                    className="
                      flex-1 px-3 py-2 border border-ink-200 rounded-lg
                      bg-white text-ink-800 text-sm
                      hover:border-jade-400
                      focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                      transition-all duration-200
                    "
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1.5 font-medium">死亡日期范围</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={filters.deathDateFrom || ''}
                    onChange={e => setFilters(prev => ({ ...prev, deathDateFrom: e.target.value }))}
                    className="
                      flex-1 px-3 py-2 border border-ink-200 rounded-lg
                      bg-white text-ink-800 text-sm
                      hover:border-jade-400
                      focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                      transition-all duration-200
                    "
                  />
                  <span className="text-ink-400 text-xs">至</span>
                  <input
                    type="date"
                    value={filters.deathDateTo || ''}
                    onChange={e => setFilters(prev => ({ ...prev, deathDateTo: e.target.value }))}
                    className="
                      flex-1 px-3 py-2 border border-ink-200 rounded-lg
                      bg-white text-ink-800 text-sm
                      hover:border-jade-400
                      focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                      transition-all duration-200
                    "
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1.5 font-medium">民族</label>
                <input
                  type="text"
                  value={filters.nationality || ''}
                  onChange={e => setFilters(prev => ({ ...prev, nationality: e.target.value }))}
                  className="
                    w-full px-3 py-2.5 border border-ink-200 rounded-lg
                    bg-white text-ink-800 text-sm
                    placeholder:text-ink-400
                    hover:border-jade-400
                    focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                    transition-all duration-200
                  "
                  placeholder="输入民族..."
                />
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1.5 font-medium">学历</label>
                <input
                  type="text"
                  value={filters.education || ''}
                  onChange={e => setFilters(prev => ({ ...prev, education: e.target.value }))}
                  className="
                    w-full px-3 py-2.5 border border-ink-200 rounded-lg
                    bg-white text-ink-800 text-sm
                    placeholder:text-ink-400
                    hover:border-jade-400
                    focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                    transition-all duration-200
                  "
                  placeholder="输入学历..."
                />
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1.5 font-medium">血型</label>
                <select
                  value={filters.bloodType || ''}
                  onChange={e => setFilters(prev => ({ ...prev, bloodType: e.target.value || undefined }))}
                  className="
                    w-full px-3 py-2.5 border border-ink-200 rounded-lg
                    bg-white text-ink-800 text-sm
                    hover:border-jade-400
                    focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400
                    transition-all duration-200
                  "
                >
                  <option value="">全部</option>
                  <option value="A">A 型</option>
                  <option value="B">B 型</option>
                  <option value="AB">AB 型</option>
                  <option value="O">O 型</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex gap-2 relative z-10">
        <button
          onClick={handleSearch}
          className="
            btn-ink flex-1 px-4 py-2.5 
            bg-ink-800 text-rice-paper rounded-lg text-sm font-medium
            hover:bg-ink-900
            focus:outline-none focus:ring-2 focus:ring-ink-800/30
            transition-all duration-200
            shadow-md shadow-ink-800/20
          "
        >
          搜索
        </button>
        <button
          onClick={handleClear}
          className="
            btn-ink px-4 py-2.5 
            bg-ink-100 text-ink-600 rounded-lg text-sm font-medium
            hover:bg-ink-200
            focus:outline-none focus:ring-2 focus:ring-ink-400/30
            transition-all duration-200
          "
        >
          清除
        </button>
      </div>
    </div>
  );
}
