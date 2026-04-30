import { useState } from 'react';
import type { Person } from '../../types';

interface AddPersonModalProps {
  persons: Person[];
  onAdd: (person: Person) => void;
  onClose: () => void;
}

export function AddPersonModal({ persons, onAdd, onClose }: AddPersonModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [relationType, setRelationType] = useState<'child' | 'spouse' | 'root'>('child');
  const [relatedPersonId, setRelatedPersonId] = useState('');
  const [occupation, setOccupation] = useState('');
  const [notes, setNotes] = useState('');

  // 获取可选的关联人员
  const getRelatedPersons = () => {
    if (relationType === 'child') {
      // 子女：选择父母
      return persons.filter(p => p.gender === 'male');
    } else if (relationType === 'spouse') {
      // 配偶：选择未婚的人
      return persons.filter(p => !p.spouseId);
    }
    return [];
  };

  const relatedPersons = getRelatedPersons();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('请输入姓名');
      return;
    }

    // 生成新的ID
    const maxId = persons.reduce((max, p) => {
      const num = parseInt(p.id.replace(/\D/g, ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);

    const newPerson: Person = {
      id: `S${String(maxId + 1).padStart(3, '0')}`,
      name: name.trim(),
      gender,
      birthDate: birthDate || undefined,
      occupation: occupation || undefined,
      notes: notes || undefined,
    };

    // 设置关系
    if (relationType === 'child' && relatedPersonId) {
      const parent = persons.find(p => p.id === relatedPersonId);
      if (parent) {
        newPerson.parentId = relatedPersonId;
        newPerson.generation = (parent.generation || 1) + 1;
      }
    } else if (relationType === 'spouse' && relatedPersonId) {
      const spouse = persons.find(p => p.id === relatedPersonId);
      if (spouse) {
        newPerson.spouseId = relatedPersonId;
        newPerson.generation = spouse.generation;
      }
    } else {
      // 根节点或无关联
      newPerson.generation = 1;
    }

    onAdd(newPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="
        bg-white rounded-2xl shadow-2xl w-96 max-h-[90vh] overflow-y-auto
        animate-fade-in-scale
      ">
        <div className="p-6 border-b border-ink-100">
          <div className="flex items-center justify-between">
            <h2 
              className="text-lg font-bold text-ink-800"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              添加新成员
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 hover:text-ink-700 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              姓名 <span className="text-cinnabar">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400"
              placeholder="请输入姓名"
              required
            />
          </div>

          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              性别 <span className="text-cinnabar">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  gender === 'male'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                男
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  gender === 'female'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                女
              </button>
            </div>
          </div>

          {/* 出生日期 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              出生日期
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400"
            />
          </div>

          {/* 关系类型 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              家庭关系 <span className="text-cinnabar">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRelationType('child');
                  setRelatedPersonId('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  relationType === 'child'
                    ? 'bg-jade-500 text-white shadow-sm'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                子女
              </button>
              <button
                type="button"
                onClick={() => {
                  setRelationType('spouse');
                  setRelatedPersonId('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  relationType === 'spouse'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                配偶
              </button>
              <button
                type="button"
                onClick={() => {
                  setRelationType('root');
                  setRelatedPersonId('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  relationType === 'root'
                    ? 'bg-ink-700 text-white shadow-sm'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                始祖
              </button>
            </div>
          </div>

          {/* 关联人员选择 */}
          {relationType !== 'root' && (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                {relationType === 'child' ? '选择父母' : '选择配偶'}
              </label>
              <select
                value={relatedPersonId}
                onChange={e => setRelatedPersonId(e.target.value)}
                className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400"
              >
                <option value="">请选择...</option>
                {relatedPersons.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) - 第{p.generation || '?'}代
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 职业 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              职业
            </label>
            <input
              type="text"
              value={occupation}
              onChange={e => setOccupation(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400"
              placeholder="请输入职业"
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              备注
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade-400/30 focus:border-jade-400 resize-none"
              rows={3}
              placeholder="请输入备注"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-ink-100 text-ink-600 rounded-lg text-sm font-medium hover:bg-ink-200 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-jade-500 text-white rounded-lg text-sm font-medium hover:bg-jade-600 transition-all shadow-sm shadow-jade-500/20"
            >
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
