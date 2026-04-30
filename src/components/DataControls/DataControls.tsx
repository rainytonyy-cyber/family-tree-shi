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
          btn-ink px-4 py-2 
          bg-jade-500 text-white rounded-lg text-sm font-medium
          hover:bg-jade-600
          focus:outline-none focus:ring-2 focus:ring-jade-500/30
          transition-all duration-200
          shadow-sm shadow-jade-500/20
          flex items-center gap-2
        "
      >
        <span>📥</span>
        <span>导入</span>
      </button>

      <button
        onClick={handleExport}
        disabled={persons.length === 0}
        className="
          btn-ink px-4 py-2 
          bg-ink-700 text-rice-paper rounded-lg text-sm font-medium
          hover:bg-ink-800
          focus:outline-none focus:ring-2 focus:ring-ink-700/30
          transition-all duration-200
          shadow-sm shadow-ink-700/20
          disabled:bg-ink-300 disabled:cursor-not-allowed disabled:shadow-none
          flex items-center gap-2
        "
      >
        <span>📤</span>
        <span>导出</span>
      </button>

      <div className="h-6 w-px bg-ink-200"></div>

      <button
        onClick={onAdd}
        className="
          btn-ink px-4 py-2 
          bg-gold-500 text-white rounded-lg text-sm font-medium
          hover:bg-gold-400
          focus:outline-none focus:ring-2 focus:ring-gold-500/30
          transition-all duration-200
          shadow-sm shadow-gold-500/20
          flex items-center gap-2
        "
      >
        <span>➕</span>
        <span>添加</span>
      </button>
    </div>
  );
}
