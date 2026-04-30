// TerminusDB 家谱数据库初始化脚本
// 运行: node scripts/init-terminusdb.js

const TERMINUS_URL = 'http://localhost:6363';
const DB_NAME = 'family-tree';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

const AUTH = 'Basic ' + Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');

async function initDatabase() {
  console.log('初始化TerminusDB家谱数据库...');

  try {
    // 1. 创建数据库
    console.log(`创建数据库: ${DB_NAME}`);
    const createDbResponse = await fetch(`${TERMINUS_URL}/api/db/admin/${DB_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH
      },
      body: JSON.stringify({
        label: '家谱数据库',
        comment: 'Family Tree Database with TerminusDB'
      })
    });

    if (createDbResponse.ok) {
      console.log('✓ 数据库创建成功');
    } else {
      const error = await createDbResponse.text();
      if (error.includes('already exists')) {
        console.log('✓ 数据库已存在');
      } else {
        console.log('数据库创建响应:', error);
      }
    }

    // 2. 定义Schema - 使用TerminusDB正确的格式
    console.log('定义数据模型...');
    
    const schema = [
      {
        "@type": "Class",
        "@id": "Person",
        "name": "xsd:string",
        "gender": { "@type": "Enum", "@id": "GenderEnum", "@value": ["male", "female", "other"] },
        "birthDate": { "@type": "Optional", "@class": "xsd:date" },
        "deathDate": { "@type": "Optional", "@class": "xsd:date" },
        "bloodType": { "@type": "Optional", "@class": { "@type": "Enum", "@id": "BloodTypeEnum", "@value": ["A", "B", "AB", "O"] } },
        "nationality": { "@type": "Optional", "@class": "xsd:string" },
        "education": { "@type": "Optional", "@class": "xsd:string" },
        "occupation": { "@type": "Optional", "@class": "xsd:string" },
        "address": { "@type": "Optional", "@class": "xsd:string" },
        "photoPath": { "@type": "Optional", "@class": "xsd:string" },
        "notes": { "@type": "Optional", "@class": "xsd:string" }
      },
      {
        "@type": "Class",
        "@id": "Partnership",
        "partner1": "Person",
        "partner2": "Person",
        "startDate": { "@type": "Optional", "@class": "xsd:date" },
        "endDate": { "@type": "Optional", "@class": "xsd:date" },
        "status": { "@type": "Enum", "@id": "PartnershipStatusEnum", "@value": ["married", "divorced", "widowed", "separated"] },
        "notes": { "@type": "Optional", "@class": "xsd:string" }
      },
      {
        "@type": "Class",
        "@id": "ParentChild",
        "parent": "Person",
        "child": "Person",
        "relationshipType": { "@type": "Enum", "@id": "RelationshipTypeEnum", "@value": ["biological", "adoptive", "step"] },
        "notes": { "@type": "Optional", "@class": "xsd:string" }
      }
    ];

    // 3. 提交Schema
    const schemaResponse = await fetch(`${TERMINUS_URL}/api/schema/admin/${DB_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH
      },
      body: JSON.stringify(schema)
    });

    if (schemaResponse.ok) {
      console.log('✓ Schema定义成功');
    } else {
      const error = await schemaResponse.text();
      console.error('Schema定义失败:', error);
      throw new Error(`Schema定义失败: ${error}`);
    }

    console.log('✓ 数据库初始化完成！');
    return true;

  } catch (error) {
    console.error('初始化失败:', error.message);
    return false;
  }
}

// 运行初始化
initDatabase().then(success => {
  if (success) {
    console.log('\n可以开始导入数据了。');
  } else {
    console.log('\n初始化失败，请检查错误信息。');
    process.exit(1);
  }
});
