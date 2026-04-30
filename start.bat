@echo off
chcp 65001 >nul
echo ========================================
echo 家谱应用启动脚本
echo ========================================
echo.

set PATH=D:\Program Files\nodejs\;%PATH%

echo 正在启动开发服务器...
echo 启动完成后请访问: http://localhost:5173/
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================

npm run dev
