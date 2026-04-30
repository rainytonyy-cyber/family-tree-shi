# 启动开发服务器（后台运行）
Write-Host "正在启动家谱应用开发服务器..." -ForegroundColor Green

# 检查 Node.js 是否可用
$nodePath = "D:\Program Files\nodejs\node.exe"
if (-not (Test-Path $nodePath)) {
    Write-Host "错误: 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 设置 PATH
$env:PATH = "D:\Program Files\nodejs\;" + $env:PATH

# 启动开发服务器（后台进程）
$process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $PSScriptRoot -PassThru -WindowStyle Hidden

# 等待服务器启动
Write-Host "等待服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 检查进程是否运行
if ($process.HasExited) {
    Write-Host "错误: 服务器启动失败" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "家谱应用已启动!" -ForegroundColor Green
Write-Host "访问地址: http://localhost:5173/" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Gray

# 保持脚本运行
try {
    while ($true) {
        Start-Sleep -Seconds 1
        if ($process.HasExited) {
            Write-Host "服务器已停止" -ForegroundColor Red
            break
        }
    }
} finally {
    if (-not $process.HasExited) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Write-Host "服务器已停止" -ForegroundColor Red
    }
}
