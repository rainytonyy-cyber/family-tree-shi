import { useRef } from 'react';
import type { Person } from '../../types';
import { parseCSV, generateCSV, downloadCSV } from '../../utils/csv';

interface DataControlsProps {
  persons: Person[];
  onImport: (persons: Person[]) => void;
  onAdd: () => void;
}

export function DataControls({ persons, onImport, onAdd }: DataControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseCSV(text);
      onImport(imported);
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查 CSV 文件格式');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    const csvContent = generateCSV(persons);
    downloadCSV(csvContent, `family-tree-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="
          px-4 py-2 
          bg-emerald-600 text-white rounded-lg text-sm font-medium
          hover:bg-emerald-700
          focus:outline-none focus:ring-2 focus:ring-emerald-500/30
          transition-all duration-200
          shadow-sm
          flex items-center gap-2
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>导入</span>
      </button>

      <button
        onClick={handleExport}
        disabled={persons.length === 0}
        className="
          px-4 py-2 
          bg-slate-700 text-white rounded-lg text-sm font-medium
          hover:bg-slate-800
          focus:outline-none focus:ring-2 focus:ring-slate-500/30
          transition-all duration-200
          shadow-sm
          disabled:bg-slate-300 disabled:cursor-not-allowed
          flex items-center gap-2
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>导出</span>
      </button>

      <div className="h-6 w-px bg-slate-300"></div>

      <button
        onClick={onAdd}
        className="
          px-4 py-2 
          bg-amber-500 text-white rounded-lg text-sm font-medium
          hover:bg-amber-600
          focus:outline-none focus:ring-2 focus:ring-amber-500/30
          transition-all duration-200
          shadow-sm
          flex items-center gap-2
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>添加</span>
      </button>
    </div>
  );
}
