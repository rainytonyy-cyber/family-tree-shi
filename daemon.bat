@echo off
chcp 65001 >nul
setlocal

set ACTION=%1
if "%ACTION%"=="" set ACTION=start

echo ========================================
echo 家谱应用守护进程管理
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0daemon.ps1" %ACTION%

echo.
pause
