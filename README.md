# 家谱管理系统

基于 React + TypeScript + Vite + Tailwind CSS 构建的家谱管理应用，通过 CSV 管理数据，支持树状结构展示血缘关系和本地搜索功能。

## 功能特性

- **CSV 数据管理** - 支持导入/导出 CSV 格式的家族数据
- **树状血缘关系展示** - SVG 自绘树状图，支持水平/垂直布局切换
- **交互操作** - 鼠标滚轮缩放、拖拽平移、重置视图
- **本地搜索** - 支持按姓名、日期范围、职业、地址等多字段搜索
- **人员管理** - 查看详情、编辑、删除、添加新成员
- **配偶/女儿/女婿/表亲** - 支持单独控制显示/隐藏

## 快速开始

### 环境要求

- Node.js v18+ (推荐 v20+)
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

**方式一：直接启动**
```bash
npm run dev
```

**方式二：Windows 批处理**
```bash
start.bat
```

**方式三：PowerShell 脚本**
```powershell
.\start.ps1
```

**方式四：macOS LaunchAgent 守护进程**
```bash
cat > "$HOME/Library/LaunchAgents/com.family-tree-shi.dev.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.family-tree-shi.dev</string>
  <key>WorkingDirectory</key>
  <string>$(pwd)</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>npm run dev -- --host 127.0.0.1</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/family-tree-shi.dev.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/family-tree-shi.dev.err.log</string>
</dict>
</plist>
EOF

launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.family-tree-shi.dev.plist"
launchctl kickstart -k "gui/$(id -u)/com.family-tree-shi.dev"
open http://localhost:5173/
```

启动后访问: http://localhost:5173/

macOS 守护进程常用命令：

```bash
# 查看运行状态
launchctl print "gui/$(id -u)/com.family-tree-shi.dev"

# 查看日志
tail -f /tmp/family-tree-shi.dev.log /tmp/family-tree-shi.dev.err.log

# 停止并卸载守护进程
launchctl bootout "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.family-tree-shi.dev.plist"
```

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

## 项目结构

```
family-tree/
├── src/
│   ├── components/          # UI 组件
│   │   ├── TreeView/        # 树状图组件（缩放/拖拽/方向切换）
│   │   ├── SearchPanel/     # 搜索面板
│   │   ├── PersonCard/      # 人员详情卡片
│   │   ├── DataControls/    # CSV 导入导出控制
│   │   └── AddPersonModal/  # 添加人员模态框
│   ├── utils/               # 工具函数
│   │   ├── csv.ts           # CSV 解析/生成
│   │   ├── treeLayout.ts    # 树布局算法
│   │   └── search.ts        # 搜索逻辑
│   ├── types/               # TypeScript 类型定义
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 入口文件
├── data/
│   └── shi-family/          # 史姓家族数据
│       └── shi-family.csv   # CSV 数据文件
├── start.bat                # Windows 启动脚本
├── start.ps1                # PowerShell 启动脚本
└── package.json
```

## CSV 数据格式

支持以下字段：

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | string | 唯一标识 | S001 |
| surname | string | 姓 | 史 |
| givenName | string | 名 | 太公 |
| previousNames | string | 曾用名（多个用分号分隔） | 李氏 |
| gender | string | 性别 | male/female/other |
| birthDate | string | 出生日期 | 1920-01-01 |
| deathDate | string | 死亡日期 | 1995-05-10 |
| bloodType | string | 血型 | A/B/AB/O |
| nationality | string | 民族 | 汉族 |
| education | string | 学历 | 本科 |
| occupation | string | 职业 | 工程师 |
| address | string | 地址 | 北京市 |
| photoPath | string | 照片路径 | - |
| fatherId | string | 父亲ID | S001 |
| motherId | string | 母亲ID | S002 |
| spouseIds | string | 配偶ID（多个用分号分隔） | S003;S004 |
| generation | number | 辈分代数 | 1 |
| notes | string | 备注 | - |

### 数据说明

- **id**: 唯一标识符，建议使用 `S001`, `S002` 格式
- **surname/givenName**: 姓和名分开存储，支持复姓（如"司马"）
- **previousNames**: 曾用名，多个用分号 `;` 分隔
- **fatherId/motherId**: 分别记录父亲和母亲，支持同父异母/同母异父
- **spouseIds**: 支持多配偶，多个用分号 `;` 分隔
- **generation**: 辈分代数，用于树状图布局

### 示例数据

```csv
id,surname,givenName,previousNames,gender,birthDate,...,fatherId,motherId,spouseIds,generation,notes
S001,史,太公,,male,1920-01-01,...,,,S002,1,始祖
S002,史,太婆,李氏,female,1922-03-15,...,,,S001,1,始祖配偶
S003,史,大伯,,male,1945-06-20,...,S001,S002,S004,2,长子
```

## 使用说明

1. **导入数据** - 点击「导入」按钮加载自定义 CSV 数据
2. **导出数据** - 点击「导出」按钮下载当前数据
3. **搜索** - 点击「搜索」按钮展开搜索面板，支持按姓名、日期、职业等搜索
4. **切换布局** - 顶部下拉框切换水平/垂直布局
5. **查看详情** - 点击节点查看人员详细信息
6. **缩放拖拽** - 鼠标滚轮缩放，拖拽平移
7. **显示控制** - 可单独控制配偶/女儿/女婿/表亲的显示

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+F | 打开搜索 |
| Ctrl+H | 切换布局 |
| Ctrl+S | 显示/隐藏配偶 |
| Ctrl+D | 显示/隐藏女儿 |
| Ctrl+I | 显示/隐藏统计 |
| ESC | 关闭面板 |

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS

## License

MIT
