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
  const isMale = person.gender === 'male';

  const infoItems = [
    { label: '出生日期', value: person.birthDate, icon: '📅' },
    { label: '死亡日期', value: person.deathDate, icon: '🕊️' },
    { label: '血型', value: person.bloodType, icon: '🩸' },
    { label: '民族', value: person.nationality, icon: '🏮' },
    { label: '学历', value: person.education, icon: '📚' },
    { label: '职业', value: person.occupation, icon: '💼' },
    { label: '地址', value: person.address, icon: '📍' },
  ].filter(item => item.value);

  return (
    <div className="
      w-80 bg-white/95 backdrop-blur-sm border-l border-ink-200 
      flex flex-col animate-slide-right
      paper-texture
      shadow-xl shadow-ink-900/5
    ">
      {/* 头部 */}
      <div className="p-5 border-b border-ink-100 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* 头像占位 */}
            <div className={`
              w-14 h-14 rounded-xl flex items-center justify-center
              ${isMale 
                ? 'bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200' 
                : 'bg-gradient-to-br from-rose-100 to-rose-50 border border-rose-200'
              }
            `}>
              <span className="text-2xl">{isMale ? '♂' : '♀'}</span>
            </div>
            <div>
              <h2 
                className="text-xl font-bold text-ink-800"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {person.name}
              </h2>
              <p className="text-xs text-ink-500 mt-0.5">
                {person.occupation || '未填写职业'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="
              w-8 h-8 rounded-lg bg-ink-50 text-ink-400
              hover:bg-ink-100 hover:text-ink-600
              flex items-center justify-center
              transition-all duration-200
            "
          >
            ✕
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-5 relative z-10">
        {/* 基本信息 */}
        <div className="space-y-3">
          {infoItems.map((item, index) => (
            <div 
              key={item.label}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-base">{item.icon}</span>
              <div className="flex-1">
                <span className="text-xs text-ink-500">{item.label}</span>
                <p className="text-sm text-ink-800 mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 家庭关系 */}
        <div className="mt-5 pt-5 border-t border-ink-100">
          <h3 
            className="text-sm font-semibold text-ink-700 mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            家庭关系
          </h3>
          
          <div className="space-y-3">
            {parent && (
              <div className="flex items-center gap-3 p-2.5 bg-ink-50 rounded-lg">
                <span className="text-base">👨‍👩‍👦</span>
                <div>
                  <span className="text-xs text-ink-500">父母</span>
                  <p className="text-sm text-ink-800 font-medium">{parent.name}</p>
                </div>
              </div>
            )}
            
            {spouse && (
              <div className="flex items-center gap-3 p-2.5 bg-jade-50 rounded-lg">
                <span className="text-base">💑</span>
                <div>
                  <span className="text-xs text-ink-500">配偶</span>
                  <p className="text-sm text-ink-800 font-medium">{spouse.name}</p>
                </div>
              </div>
            )}
            
            {children.length > 0 && (
              <div className="flex items-start gap-3 p-2.5 bg-gold-100 rounded-lg">
                <span className="text-base">👶</span>
                <div>
                  <span className="text-xs text-ink-500">子女 ({children.length})</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {children.map(child => (
                      <span 
                        key={child.id}
                        className="px-2 py-0.5 bg-white rounded-md text-xs text-ink-700 border border-ink-200"
                      >
                        {child.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {!parent && !spouse && children.length === 0 && (
              <p className="text-sm text-ink-400 text-center py-3">暂无家庭关系信息</p>
            )}
          </div>
        </div>

        {/* 备注 */}
        {person.notes && (
          <div className="mt-5 pt-5 border-t border-ink-100">
            <h3 
              className="text-sm font-semibold text-ink-700 mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              备注
            </h3>
            <p className="text-sm text-ink-600 bg-ink-50 p-3 rounded-lg leading-relaxed">
              {person.notes}
            </p>
          </div>
        )}
      </div>

      {/* 底部操作按钮 */}
      <div className="p-4 border-t border-ink-100 flex gap-2 relative z-10">
        <button
          onClick={() => onEdit(person)}
          className="
            btn-ink flex-1 px-4 py-2.5 
            bg-ink-800 text-rice-paper rounded-lg text-sm font-medium
            hover:bg-ink-900
            focus:outline-none focus:ring-2 focus:ring-ink-800/30
            transition-all duration-200
            shadow-md shadow-ink-800/20
          "
        >
          编辑
        </button>
        <button
          onClick={() => onDelete(person.id)}
          className="
            btn-ink px-4 py-2.5 
            bg-cinnabar text-white rounded-lg text-sm font-medium
            hover:bg-cinnabar-light
            focus:outline-none focus:ring-2 focus:ring-cinnabar/30
            transition-all duration-200
            shadow-md shadow-cinnabar/20
          "
        >
          删除
        </button>
      </div>
    </div>
  );
}
