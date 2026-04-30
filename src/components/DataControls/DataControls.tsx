import { useRef } from 'react';
import type { Person } from '../../types';
import { parseCSV, generateCSV, downloadCSV } from '../../utils/csv';

interface DataControlsProps {
  persons: Person[];
  onImport: (persons: Person[]) => void;
  onAddPerson: () => void;
}

export function DataControls({ persons, onImport, onAddPerson }: DataControlsProps) {
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
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        导入 CSV
      </button>

      <button
        onClick={handleExport}
        disabled={persons.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        导出 CSV
      </button>

      <button
        onClick={onAddPerson}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        添加人员
      </button>
    </div>
  );
}
