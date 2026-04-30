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
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">搜索</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">姓名</label>
            <input
              type="text"
              value={filters.name || ''}
              onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入姓名搜索..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">职业</label>
            <input
              type="text"
              value={filters.occupation || ''}
              onChange={e => setFilters(prev => ({ ...prev, occupation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入职业..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">地址</label>
            <input
              type="text"
              value={filters.address || ''}
              onChange={e => setFilters(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入地址..."
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? '收起更多条件' : '展开更多条件'}
          </button>

          {isExpanded && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-sm text-gray-600 mb-1">出生日期范围</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.birthDateFrom || ''}
                    onChange={e => setFilters(prev => ({ ...prev, birthDateFrom: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="self-center text-gray-400">至</span>
                  <input
                    type="date"
                    value={filters.birthDateTo || ''}
                    onChange={e => setFilters(prev => ({ ...prev, birthDateTo: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">死亡日期范围</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.deathDateFrom || ''}
                    onChange={e => setFilters(prev => ({ ...prev, deathDateFrom: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="self-center text-gray-400">至</span>
                  <input
                    type="date"
                    value={filters.deathDateTo || ''}
                    onChange={e => setFilters(prev => ({ ...prev, deathDateTo: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">民族</label>
                <input
                  type="text"
                  value={filters.nationality || ''}
                  onChange={e => setFilters(prev => ({ ...prev, nationality: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入民族..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">学历</label>
                <input
                  type="text"
                  value={filters.education || ''}
                  onChange={e => setFilters(prev => ({ ...prev, education: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入学历..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">血型</label>
                <select
                  value={filters.bloodType || ''}
                  onChange={e => setFilters(prev => ({ ...prev, bloodType: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="p-4 flex gap-2">
        <button
          onClick={handleSearch}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          搜索
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          清除
        </button>
      </div>
    </div>
  );
}
