import type { Person } from '../types';

const CSV_HEADERS: (keyof Person)[] = [
  'id', 'name', 'gender', 'birthDate', 'deathDate', 'bloodType',
  'nationality', 'education', 'occupation', 'address', 'photoPath',
  'parentId', 'spouseId', 'generation', 'notes'
];

function escapeCSV(value: string | undefined): string {
  if (!value) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

export function parseCSV(csvText: string): Person[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const persons: Person[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

    const person: Record<string, string> = {};
    headers.forEach((header, index) => {
      person[header] = values[index] || '';
    });

    // 转换generation为数字
    const parsed = person as unknown as Person;
    if (parsed.generation) {
      (parsed as any).generation = parseInt(parsed.generation as any, 10) || 1;
    }

    persons.push(parsed);
  }

  return persons;
}

export function generateCSV(persons: Person[]): string {
  const headerLine = CSV_HEADERS.join(',');
  const dataLines = persons.map(person =>
    CSV_HEADERS.map(header => escapeCSV(String(person[header] || ''))).join(',')
  );

  return [headerLine, ...dataLines].join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
