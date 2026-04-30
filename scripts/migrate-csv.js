// CSV数据迁移到TerminusDB脚本
// 运行: node scripts/migrate-csv.js

const fs = require('fs');
const path = require('path');

const TERMINUS_URL = 'http://localhost:6363';
const DB_NAME = 'family-tree';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

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
  console.log('开始CSV数据迁移到TerminusDB...');

  try {
    // 1. 读取CSV文件
    const csvPath = path.join(__dirname, '..', 'data', 'shi-family', 'shi-family.csv');
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const persons = parseCSV(csvText);
    console.log(`读取到 ${persons.length} 条人员记录`);

    // 2. 导入Person实体
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

      const response = await fetch(`${TERMINUS_URL}/api/document/admin/${DB_NAME}/local/commit?author=admin&message=Add person ${person.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${ADMIN_USER}:${ADMIN_PASS}`)
        },
        body: JSON.stringify(personDoc)
      });

      if (response.ok) {
        console.log(`  ✓ ${person.id}: ${person.name}`);
      } else {
        const error = await response.text();
        console.error(`  ✗ ${person.id}: ${error}`);
      }
    }

    // 3. 创建伴侣关系
    console.log('创建伴侣关系...');
    const partnerships = new Set();
    for (const person of persons) {
      if (person.spouseId) {
        const pairKey = [person.id, person.spouseId].sort().join('_');
        if (!partnerships.has(pairKey)) {
          partnerships.add(pairKey);

          const partnershipDoc = {
            '@type': 'Partnership',
            '@id': `P_${pairKey}`,
            'partner1': { '@id': person.id },
            'partner2': { '@id': person.spouseId },
            'status': 'married'
          };

          const response = await fetch(`${TERMINUS_URL}/api/document/admin/${DB_NAME}/local/commit?author=admin&message=Add partnership ${pairKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(`${ADMIN_USER}:${ADMIN_PASS}`)
            },
            body: JSON.stringify(partnershipDoc)
          });

          if (response.ok) {
            console.log(`  ✓ 伴侣: ${person.id} - ${person.spouseId}`);
          } else {
            const error = await response.text();
            console.error(`  ✗ 伴侣 ${pairKey}: ${error}`);
          }
        }
      }
    }

    // 4. 创建亲子关系
    console.log('创建亲子关系...');
    for (const person of persons) {
      if (person.parentId) {
        const parentChildDoc = {
          '@type': 'ParentChild',
          '@id': `PC_${person.parentId}_${person.id}`,
          'parent': { '@id': person.parentId },
          'child': { '@id': person.id },
          'relationshipType': 'biological'
        };

        const response = await fetch(`${TERMINUS_URL}/api/document/admin/${DB_NAME}/local/commit?author=admin&message=Add parent-child ${person.parentId}->${person.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${ADMIN_USER}:${ADMIN_PASS}`)
          },
          body: JSON.stringify(parentChildDoc)
        });

        if (response.ok) {
          console.log(`  ✓ 亲子: ${person.parentId} -> ${person.id}`);
        } else {
          const error = await response.text();
          console.error(`  ✗ 亲子 ${person.parentId}->${person.id}: ${error}`);
        }
      }
    }

    console.log('\n✓ 数据迁移完成！');
    console.log(`  - Person: ${persons.length}`);
    console.log(`  - Partnership: ${partnerships.size}`);
    console.log(`  - ParentChild: ${persons.filter(p => p.parentId).length}`);

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
