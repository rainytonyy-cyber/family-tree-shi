// CSV数据迁移到本地JSON存储
// 运行: node scripts/migrate-csv-local.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'family-tree-db.json');
const CSV_FILE = path.join(DATA_DIR, 'shi-family', 'shi-family.csv');

// 解析CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }

  return records;
}

function parseCSVLine(line) {
  const result = [];
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

async function migrateData() {
  console.log('开始CSV数据迁移到本地JSON存储...');

  try {
    // 1. 读取CSV文件
    const csvText = fs.readFileSync(CSV_FILE, 'utf-8');
    const persons = parseCSV(csvText);
    console.log(`读取到 ${persons.length} 条人员记录`);

    // 2. 构建数据结构
    const db = {
      persons: [],
      partnerships: [],
      parentChilds: []
    };

    // 3. 导入Person实体
    console.log('导入Person实体...');
    for (const person of persons) {
      const personDoc = {
        '@type': 'Person',
        '@id': person.id,
        'name': person.name,
        'gender': person.gender,
        'birthDate': person.birthDate || null,
        'deathDate': person.deathDate || null,
        'bloodType': person.bloodType || null,
        'nationality': person.nationality || null,
        'education': person.education || null,
        'occupation': person.occupation || null,
        'address': person.address || null,
        'notes': person.notes || null
      };
      db.persons.push(personDoc);
      console.log(`  ✓ ${person.id}: ${person.name}`);
    }

    // 4. 创建伴侣关系
    console.log('创建伴侣关系...');
    const partnerships = new Set();
    for (const person of persons) {
      if (person.spouseIds) {
        const spouseIds = person.spouseIds.split(';').filter(Boolean);
        for (const spouseId of spouseIds) {
          const pairKey = [person.id, spouseId].sort().join('_');
          if (!partnerships.has(pairKey)) {
            partnerships.add(pairKey);
            db.partnerships.push({
              '@type': 'Partnership',
              '@id': `P_${pairKey}`,
              'partner1': { '@id': person.id },
              'partner2': { '@id': spouseId },
              'status': 'married'
            });
            console.log(`  ✓ 伴侣: ${person.id} - ${spouseId}`);
          }
        }
      }
    }

    // 5. 创建亲子关系
    console.log('创建亲子关系...');
    for (const person of persons) {
      if (person.fatherId) {
        db.parentChilds.push({
          '@type': 'ParentChild',
          '@id': `PC_${person.fatherId}_${person.id}`,
          'parent': { '@id': person.fatherId },
          'child': { '@id': person.id },
          'relationshipType': 'biological'
        });
        console.log(`  ✓ 父子: ${person.fatherId} -> ${person.id}`);
      }
      if (person.motherId) {
        db.parentChilds.push({
          '@type': 'ParentChild',
          '@id': `PC_${person.motherId}_${person.id}`,
          'parent': { '@id': person.motherId },
          'child': { '@id': person.id },
          'relationshipType': 'biological'
        });
        console.log(`  ✓ 母子: ${person.motherId} -> ${person.id}`);
      }
    }

    // 6. 保存到文件
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

    console.log('\n✓ 数据迁移完成！');
    console.log(`  - Person: ${db.persons.length}`);
    console.log(`  - Partnership: ${db.partnerships.length}`);
    console.log(`  - ParentChild: ${db.parentChilds.length}`);
    console.log(`\n数据保存到: ${DB_FILE}`);

    return true;

  } catch (error) {
    console.error('迁移失败:', error.message);
    return false;
  }
}

// 运行迁移
migrateData().then(success => {
  if (!success) {
    process.exit(1);
  }
});
