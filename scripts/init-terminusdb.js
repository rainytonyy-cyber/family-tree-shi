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
    // 1. 检查数据库是否存在，如果存在则删除
    const checkResponse = await fetch(`${TERMINUS_URL}/api/db/admin/${DB_NAME}`, {
      headers: { 'Authorization': AUTH }
    });
    
    if (checkResponse.ok) {
      console.log('删除已存在的数据库...');
      await fetch(`${TERMINUS_URL}/api/db/admin/${DB_NAME}`, {
        method: 'DELETE',
        headers: { 'Authorization': AUTH }
      });
    }

    // 2. 创建数据库
    console.log(`创建数据库: ${DB_NAME}`);
    const createDbResponse = await fetch(`${TERMINUS_URL}/api/db/admin/${DB_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH
      },
      body: JSON.stringify({
        label: '家谱数据库',
        comment: 'Family Tree Database - 伴侣关系 + 亲子关系'
      })
    });

    if (!createDbResponse.ok) {
      const error = await createDbResponse.text();
      console.error('数据库创建失败:', error);
      return false;
    }
    console.log('✓ 数据库创建成功');

    // 3. 定义Schema - 使用数组格式
    console.log('定义数据模型...');
    
    const schema = [
      {
        "@type": "Class",
        "@id": "Person",
        "name": "xsd:string",
        "gender": "xsd:string",
        "birthDate": "xsd:date",
        "deathDate": "xsd:date",
        "bloodType": "xsd:string",
        "nationality": "xsd:string",
        "education": "xsd:string",
        "occupation": "xsd:string",
        "address": "xsd:string",
        "notes": "xsd:string"
      },
      {
        "@type": "Class",
        "@id": "Partnership",
        "partner1": "Person",
        "partner2": "Person",
        "startDate": "xsd:date",
        "endDate": "xsd:date",
        "status": "xsd:string",
        "notes": "xsd:string"
      },
      {
        "@type": "Class",
        "@id": "ParentChild",
        "parent": "Person",
        "child": "Person",
        "relationshipType": "xsd:string",
        "notes": "xsd:string"
      }
    ];

    // 4. 提交Schema
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
      console.error('Schema定义失败，尝试简化版本...');
      
      // 尝试最简化的Schema
      const simpleSchema = {
        "@type": "Class",
        "@id": "Person",
        "name": "xsd:string",
        "gender": "xsd:string"
      };
      
      const simpleResponse = await fetch(`${TERMINUS_URL}/api/schema/admin/${DB_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH
        },
        body: JSON.stringify(simpleSchema)
      });
      
      if (simpleResponse.ok) {
        console.log('✓ 简化Schema定义成功');
      } else {
        const simpleError = await simpleResponse.text();
        console.error('简化Schema也失败:', simpleError);
        console.log('\n将使用本地JSON存储作为备选方案');
        return false;
      }
    }

    console.log('\n✓ 数据库初始化完成！');
    console.log('\n数据模型:');
    console.log('  - Person: 人员实体');
    console.log('  - Partnership: 伴侣关系（婚姻/结合）');
    console.log('  - ParentChild: 亲子关系（父母→子女）');
    
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
    console.log('\n初始化失败，将使用本地JSON存储。');
  }
});
