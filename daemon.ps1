# Family Tree App Daemon Script
# Usage: .\daemon.ps1 [start|stop|status|restart]

param(
    [string]$Action = "start"
)

$ProjectRoot = $PSScriptRoot
$PidFile = Join-Path $ProjectRoot ".server.pid"
$LogFile = Join-Path $ProjectRoot ".server.log"

function Get-ServerProcess {
    if (Test-Path $PidFile) {
        $savedPid = Get-Content $PidFile
        $process = Get-Process -Id $savedPid -ErrorAction SilentlyContinue
        if ($process -and $process.ProcessName -eq "node") {
            return $process
        }
    }
    return $null
}

function Start-Server {
    $existing = Get-ServerProcess
    if ($existing) {
        Write-Host "Server already running (PID: $($existing.Id))" -ForegroundColor Yellow
        return
    }

    Write-Host "Starting Family Tree daemon..." -ForegroundColor Green

    $env:PATH = "D:\Program Files\nodejs\;" + $env:PATH

    $process = Start-Process -FilePath "D:\Program Files\nodejs\node.exe" `
        -ArgumentList "node_modules\vite\bin\vite.js" `
        -WorkingDirectory $ProjectRoot `
        -WindowStyle Hidden `
        -PassThru

    $process.Id | Out-File -FilePath $PidFile -Encoding UTF8

    Write-Host "Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    $portCheck = Test-NetConnection -ComputerName localhost -Port 5173 -WarningAction SilentlyContinue
    if ($portCheck.TcpTestSucceeded) {
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Family Tree App Started (Daemon Mode)" -ForegroundColor Green
        Write-Host "PID: $($process.Id)" -ForegroundColor White
        Write-Host "URL: http://localhost:5173/" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor White
        Write-Host "  .\daemon.ps1 status   - Check status" -ForegroundColor Gray
        Write-Host "  .\daemon.ps1 stop     - Stop server" -ForegroundColor Gray
        Write-Host "  .\daemon.ps1 restart  - Restart server" -ForegroundColor Gray
    } else {
        Write-Host "Start failed, check log: $LogFile" -ForegroundColor Red
        Stop-Server
    }
}

function Stop-Server {
    $process = Get-ServerProcess
    if ($process) {
        Write-Host "Stopping server (PID: $($process.Id))..." -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        Write-Host "Server stopped" -ForegroundColor Green
    } else {
        Write-Host "Server not running" -ForegroundColor Gray
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }
}

function Show-Status {
    $process = Get-ServerProcess
    if ($process) {
        $portCheck = Test-NetConnection -ComputerName localhost -Port 5173 -WarningAction SilentlyContinue
        $portStatus = if($portCheck.TcpTestSucceeded){"OK"}else{"Error"}
        $portColor = if($portCheck.TcpTestSucceeded){"Green"}else{"Red"}
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Server Status: Running" -ForegroundColor Green
        Write-Host "PID: $($process.Id)" -ForegroundColor White
        Write-Host "Port 5173: $portStatus" -ForegroundColor $portColor
        Write-Host "CPU: $($process.CPU)s" -ForegroundColor White
        Write-Host "Memory: $([math]::Round($process.WorkingSet64/1MB, 2)) MB" -ForegroundColor White
        Write-Host "Started: $($process.StartTime)" -ForegroundColor White
        Write-Host "URL: http://localhost:5173/" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Cyan
    } else {
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Server Status: Not Running" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Cyan
    }
}

function Restart-Server {
    Stop-Server
    Start-Sleep -Seconds 2
    Start-Server
}

switch ($Action.ToLower()) {
    "start"   { Start-Server }
    "stop"    { Stop-Server }
    "status"  { Show-Status }
    "restart" { Restart-Server }
    default   { 
        Write-Host "Usage: .\daemon.ps1 [start|stop|status|restart]" -ForegroundColor White
    }
}
