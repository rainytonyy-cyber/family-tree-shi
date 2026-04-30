import type { Person } from '../../types';

interface PersonCardProps {
  person: Person | undefined;
  allPersons: Person[];
  onClose: () => void;
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
}

export function PersonCard({ person, allPersons, onClose, onEdit, onDelete }: PersonCardProps) {
  if (!person) return null;

  const parent = person.parentId ? allPersons.find(p => p.id === person.parentId) : undefined;
  const spouse = person.spouseId ? allPersons.find(p => p.id === person.spouseId) : undefined;
  const children = allPersons.filter(p => p.parentId === person.id);

  const fields = [
    { label: 'ID', value: person.id },
    { label: '姓名', value: person.name },
    { label: '性别', value: person.gender === 'male' ? '男' : person.gender === 'female' ? '女' : '其他' },
    { label: '出生日期', value: person.birthDate },
    { label: '死亡日期', value: person.deathDate },
    { label: '血型', value: person.bloodType },
    { label: '民族', value: person.nationality },
    { label: '学历', value: person.education },
    { label: '职业', value: person.occupation },
    { label: '地址', value: person.address },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">人员详情</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {fields.map(field => (
            <div key={field.label}>
              <span className="text-sm text-gray-500">{field.label}:</span>
              <span className="ml-2 text-gray-800">{field.value || '-'}</span>
            </div>
          ))}

          <div className="pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">父母:</span>
            <span className="ml-2 text-gray-800">{parent?.name || '-'}</span>
          </div>

          <div>
            <span className="text-sm text-gray-500">配偶:</span>
            <span className="ml-2 text-gray-800">{spouse?.name || '-'}</span>
          </div>

          <div>
            <span className="text-sm text-gray-500">子女:</span>
            <span className="ml-2 text-gray-800">
              {children.length > 0 ? children.map(c => c.name).join(', ') : '-'}
            </span>
          </div>

          {person.notes && (
            <div className="pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">备注:</span>
              <p className="mt-1 text-gray-800 text-sm">{person.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex gap-2">
        <button
          onClick={() => onEdit(person)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          编辑
        </button>
        <button
          onClick={() => onDelete(person.id)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          删除
        </button>
      </div>
    </div>
  );
}
