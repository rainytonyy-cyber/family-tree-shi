# TerminusDB 家谱数据模型设计

## 核心理念

家谱中只有两种基础关系：
1. **伴侣关系** (Partnership) - 婚姻/结合
2. **亲子关系** (ParentChild) - 父母→子女

其他关系（兄弟姐妹、祖孙、堂亲）都可以由这两种推导出来。

## 数据模型

### 实体 (Documents)

#### Person (人员)
```json
{
  "@type": "Person",
  "@id": "S001",
  "name": "史太公",
  "gender": "male",
  "birthDate": "1920-01-01",
  "deathDate": "1995-05-10",
  "bloodType": "O",
  "nationality": "汉族",
  "education": "私塾",
  "occupation": "农民",
  "address": "山东省",
  "notes": "史家第一代"
}
```

### 关系 (Edges)

#### Partnership (伴侣关系)
```json
{
  "@type": "Partnership",
  "@id": "P_S001_S002",
  "partner1": { "@id": "S001" },
  "partner2": { "@id": "S002" },
  "startDate": "1945-01-01",
  "endDate": null,
  "status": "married",
  "notes": ""
}
```

#### ParentChild (亲子关系)
```json
{
  "@type": "ParentChild",
  "@id": "PC_S001_S003",
  "parent": { "@id": "S001" },
  "child": { "@id": "S003" },
  "relationshipType": "biological",
  "notes": ""
}
```

## 关系推导规则

| 关系类型 | 推导规则 |
|----------|----------|
| 兄弟姐妹 | 同一个ParentChild.parent的不同child |
| 祖孙 | ParentChild.parent.ParentChild.parent |
| 堂亲 | 父母是兄弟姐妹 |
| 配偶的父母 | Partnership.partner2的ParentChild.parent |
| 女婿 | 女儿的Partnership.partner2 |

## 优势

1. **灵活性** - 支持多次婚姻、收养、继父母等复杂关系
2. **可推导** - 所有衍生关系都可以从基础关系推导
3. **图结构** - 天然适合家谱的网络模型
4. **版本控制** - TerminusDB内置Git式操作
