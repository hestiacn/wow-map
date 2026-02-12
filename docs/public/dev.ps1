if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "提示：以管理员运行可优化浏览器控制" -ForegroundColor Yellow
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "    开发工具自动下载解压" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

# 基础URL变量
$baseUrl = "https://cnb.cool/docs.win/win/-/git/raw/master/"

# 所有下载链接
$links = @(
    "${baseUrl}VSCodeUserSetup-x64-1.109.0.part1.rar",
    "${baseUrl}VSCodeUserSetup-x64-1.109.0.part2.rar",
    "${baseUrl}Firefox-Setup-147.0.3.exe",
    "${baseUrl}node-v24.13.0-x64.msi",
    "${baseUrl}Git-2.52.0-64-bit.exe"
)

Write-Host "`n📥 同时开始下载所有文件：" -ForegroundColor Green
for ($i=0; $i -lt $links.Count; $i++) {
    $fileName = $links[$i].Split('/')[-1] -replace '%20', ' '
    Write-Host "  [$($i+1)] $fileName" -ForegroundColor White
}

Write-Host "`n🚀 第1步：打开浏览器下载所有文件..." -ForegroundColor Yellow
Write-Host "  （RAR文件立即开始，EXE文件需要安全确认）" -ForegroundColor Gray

# 函数：智能打开链接
function Invoke-SmartDownload {
    param($url)
    
    $fileName = $url.Split('/')[-1] -replace '%20', ' '
    Write-Host "  启动下载: $fileName" -ForegroundColor Gray
    
    try {
        # 尝试直接打开
        Start-Process $url -ErrorAction Stop
        Write-Host "    ✓ 已发送下载请求" -ForegroundColor Green
        return $true
    }
    catch {
        # 如果失败，尝试备用方式
        try {
            Start-Process "cmd.exe" "/c start $url" -WindowStyle Hidden
            Write-Host "    ✓ 通过CMD发送请求" -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host "    ✗ 无法打开链接" -ForegroundColor Red
            return $false
        }
    }
}

Write-Host "`n📍 重要提示：" -ForegroundColor Cyan
Write-Host "  请确保浏览器允许弹出窗口" -ForegroundColor White
Write-Host "  如果弹出拦截，请点击'允许'" -ForegroundColor White

# 同时打开所有下载链接
foreach ($link in $links) {
    Invoke-SmartDownload $link
    Start-Sleep -Milliseconds 400  # 适当间隔避免冲突
}

Write-Host "`n⏳ 第2步：智能监控RAR分卷文件下载状态..." -ForegroundColor Cyan
Write-Host "  （只监控RAR相关临时文件）" -ForegroundColor Gray

# 检测RAR分卷文件组（改进版，能处理随机字符串）
function Find-RARVolumeSets {
    $allFiles = Get-ChildItem -Path . -ErrorAction SilentlyContinue
    
    # 存储检测到的分卷组
    $volumeSets = @{}
    
    foreach ($file in $allFiles) {
        $fileName = $file.Name
        
        # 检查是否是RAR文件（包括各种格式）
        $isRARFile = $false
        $rarPatterns = @(
            '\.rar$',
            '\.part\d+\.rar$',
            '\.r\d{2,3}$',
            '_\d+\.rar$',
            '\.\d{3}$'
        )
        
        foreach ($pattern in $rarPatterns) {
            if ($fileName -match $pattern) {
                $isRARFile = $true
                break
            }
        }
        
        if (-not $isRARFile) {
            continue
        }
        
        # 处理RAR分卷文件
        $baseName = $fileName
        
        # 首先，移除可能存在的随机字符串（如.wlID5s9w.）
        # 模式：.随机字符串.（随机字符串由字母数字组成，长度通常为8-10位）
        $fileName = $fileName -replace '\.[a-zA-Z0-9]{8,10}\.', '.'
        
        # 处理常见的分卷命名模式
        # 1. .part1.rar, .part2.rar
        if ($fileName -match '\.(part\d+)\.rar$') {
            $baseName = $fileName -replace '\.(part\d+)\.rar$', ''
            $volumeNumber = $matches[1] -replace 'part', ''
        }
        # 2. .r00, .r01, .r02
        elseif ($fileName -match '\.(r\d{2,3})$') {
            $baseName = $fileName -replace '\.(r\d{2,3})$', ''
            $volumeNumber = $matches[1] -replace 'r', ''
        }
        # 3. _1.rar, _2.rar
        elseif ($fileName -match '_(\d+)\.rar$') {
            $baseName = $fileName -replace '_(\d+)\.rar$', ''
            $volumeNumber = $matches[1]
        }
        # 4. .001, .002, .003
        elseif ($fileName -match '\.(\d{3})$') {
            $baseName = $fileName -replace '\.(\d{3})$', ''
            $volumeNumber = $matches[1]
        }
        # 5. 单个RAR文件
        elseif ($fileName -match '\.rar$') {
            $baseName = $fileName -replace '\.rar$', ''
            $volumeNumber = "1"
        }
        else {
            continue
        }
        
        if (-not $volumeSets.ContainsKey($baseName)) {
            $volumeSets[$baseName] = @{
                BaseName = $baseName
                Volumes = @()
                IsMultiVolume = $false
                MainArchive = $null
                OriginalFiles = @()  # 存储原始文件名
            }
        }
        
        $volumeInfo = @{
            FileName = $fileName
            OriginalFileName = $file.Name  # 原始文件名
            VolumeNumber = $volumeNumber
            FilePath = $file.FullName
            Size = $file.Length
            IsMain = ($fileName -match '\.rar$' -and $fileName -notmatch '\.(part\d+|r\d{2,3}|_\d+|\.\d{3})')
            IsTemp = $file.Name -ne $fileName  # 判断是否为临时文件
        }
        
        $volumeSets[$baseName].Volumes += $volumeInfo
        
        # 如果是主存档文件（无分卷编号）
        if ($volumeInfo.IsMain) {
            $volumeSets[$baseName].MainArchive = $volumeInfo
        }
    }
    
    # 清理只有一个文件的组（可能不是分卷文件）
    $multiVolumeSets = @{}
    foreach ($key in $volumeSets.Keys) {
        $set = $volumeSets[$key]
        
        # 检查是否为多分卷
        if ($set.Volumes.Count -gt 1) {
            $set.IsMultiVolume = $true
            $multiVolumeSets[$key] = $set
            
            # 按卷号排序
            $set.Volumes = $set.Volumes | Sort-Object { [int]::Parse($_.VolumeNumber) }
        }
        # 单个文件但可能是分卷的第一个文件
        elseif ($set.Volumes.Count -eq 1 -and $set.Volumes[0].VolumeNumber -eq "1") {
            $set.IsMultiVolume = $true  # 假设是分卷，等待其他分卷
            $multiVolumeSets[$key] = $set
        }
    }
    
    return $multiVolumeSets
}

# 检测RAR相关临时文件（改进版，能处理随机字符串）
function Get-RARTempFiles {
    $rarTempFiles = @()
    $allFiles = Get-ChildItem -Path . -ErrorAction SilentlyContinue
    
    foreach ($file in $allFiles) {
        $fileName = $file.Name
        
        # 排除明显的非RAR临时文件（EXE文件）
        if ($fileName -match '\.exe\.(part|crdownload|tmp|download)$') {
            continue
        }
        
        # 只检查可能是RAR相关的临时文件
        # 更精确的匹配规则
        $isRARTemp = $false
        
        # 规则1: 文件名包含.rar的临时文件（包括带随机字符串的）
        if ($fileName -match '\.rar\.(crdownload|part|tmp|download)$') {
            $isRARTemp = $true
        }
        # 规则2: 文件名包含.part1.rar.part等格式（包括带随机字符串的）
        elseif ($fileName -match '\.part\d+\.rar\.(crdownload|part|tmp|download)$') {
            $isRARTemp = $true
        }
        # 规则3: 临时文件但名称看起来像RAR文件（包含.part或.crdownload，且名称中有.rar字样）
        elseif (($fileName -match '\.(crdownload|part|tmp|download)$') -and 
                ($fileName -match '\.rar')) {
            # 进一步检查：确保不是EXE文件
            if (-not $fileName -match '\.exe') {
                $isRARTemp = $true
            }
        }
        # 规则4: 包含随机字符串的RAR临时文件（如.wlID5s9w.）
        # 模式：文件名中有.随机字符串.part1.rar.part
        elseif ($fileName -match '\.[a-zA-Z0-9]{8,10}\.') {
            # 检查是否包含RAR相关模式
            $tempName = $fileName -replace '\.[a-zA-Z0-9]{8,10}\.', '.'
            if ($tempName -match '\.(rar|part\d+\.rar)\.(crdownload|part|tmp|download)$') {
                $isRARTemp = $true
            }
        }
        
        if ($isRARTemp) {
            $rarTempFiles += $file
        }
    }
    
    return $rarTempFiles
}

# 简化监控：等待RAR分卷文件组（只监控RAR相关临时文件）
function Monitor-RARVolumeSets {
    param(
        [int]$MaxWaitMinutes = 5,      # 最长等待5分钟
        [int]$CheckIntervalSeconds = 2 # 每2秒检查一次
    )
    
    Write-Host "  🔍 开始监控RAR分卷文件..." -ForegroundColor Cyan
    Write-Host "  只监控RAR相关临时文件，忽略其他格式" -ForegroundColor Gray
    
    $startTime = Get-Date
    $checkCount = 0
    
    # 先等待5秒，让下载开始
    Write-Host "  ⏳ 等待下载开始（5秒）..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
    
    while (((Get-Date) - $startTime).TotalMinutes -lt $MaxWaitMinutes) {
        $checkCount++
        $elapsed = [Math]::Floor(((Get-Date) - $startTime).TotalSeconds)
        
        # 检测所有RAR分卷组
        $volumeSets = Find-RARVolumeSets
        
        # 只检查RAR相关临时文件
        $rarTempFiles = Get-RARTempFiles
        
        # 显示状态
        Write-Host "  ⏳ 检查 #$checkCount (${elapsed}s)" -ForegroundColor DarkGray
        
        if ($volumeSets.Count -gt 0) {
            Write-Host "  检测到 $($volumeSets.Count) 个RAR分卷组:" -ForegroundColor DarkGray
            
            $allComplete = $true
            foreach ($key in $volumeSets.Keys) {
                $set = $volumeSets[$key]
                $completeCount = 0
                $totalCount = $set.Volumes.Count
                
                # 检查每个分卷是否存在且非0大小
                foreach ($volume in $set.Volumes) {
                    # 使用原始文件名检查
                    if (Test-Path $volume.OriginalFileName) {
                        $file = Get-Item $volume.OriginalFileName -ErrorAction SilentlyContinue
                        if ($file -and $file.Length -gt 0) {
                            $completeCount++
                        }
                    }
                }
                
                $status = if ($completeCount -eq $totalCount) { "✅" } else { "🔄" }
                Write-Host "    $status $($set.BaseName): $completeCount/$totalCount 个分卷" -ForegroundColor $(if ($completeCount -eq $totalCount) { "Green" } else { "Yellow" })
                
                if ($completeCount -ne $totalCount) {
                    $allComplete = $false
                }
            }
            
            # 只显示RAR相关临时文件
            if ($rarTempFiles.Count -gt 0) {
                Write-Host "    ⚠️  有 $($rarTempFiles.Count) 个RAR相关临时文件" -ForegroundColor DarkYellow
                foreach ($tempFile in $rarTempFiles) {
                    Write-Host "      - $($tempFile.Name)" -ForegroundColor DarkGray
                }
                $allComplete = $false
            }
            
            # 如果所有分卷组都完整且无RAR临时文件
            if ($allComplete -and $volumeSets.Count -gt 0) {
                Write-Host "  ✅ 所有RAR分卷文件下载完成！" -ForegroundColor Green
                Write-Host "  用时: ${elapsed}秒，检查次数: $checkCount" -ForegroundColor Gray
                
                # 显示详细信息
                foreach ($key in $volumeSets.Keys) {
                    $set = $volumeSets[$key]
                    Write-Host "  📦 $($set.BaseName):" -ForegroundColor Cyan
                    foreach ($volume in $set.Volumes) {
                        $statusIcon = if ($volume.IsTemp) { "🔄" } else { "✅" }
                        Write-Host "    $statusIcon $($volume.OriginalFileName): $(Format-FileSize $volume.Size)" -ForegroundColor Gray
                    }
                }
                
                return @{
                    Success = $true
                    VolumeSets = $volumeSets
                }
            }
        } else {
            Write-Host "    🔎 未检测到RAR分卷组，继续等待..." -ForegroundColor Gray
        }
        
        Start-Sleep -Seconds $CheckIntervalSeconds
    }
    
    $elapsed = [Math]::Floor(((Get-Date) - $startTime).TotalSeconds)
    Write-Host "  ⚠️  监控超时（${MaxWaitMinutes}分钟，${elapsed}秒）" -ForegroundColor Yellow
    
    # 最终检查
    $finalVolumeSets = Find-RARVolumeSets
    $finalTempFiles = Get-RARTempFiles
    
    if ($finalVolumeSets.Count -gt 0) {
        Write-Host "  最终状态:" -ForegroundColor Cyan
        $allComplete = $true
        
        foreach ($key in $finalVolumeSets.Keys) {
            $set = $finalVolumeSets[$key]
            $completeCount = 0
            $totalCount = $set.Volumes.Count
            
            foreach ($volume in $set.Volumes) {
                # 使用原始文件名检查
                if (Test-Path $volume.OriginalFileName) {
                    $file = Get-Item $volume.OriginalFileName -ErrorAction SilentlyContinue
                    if ($file -and $file.Length -gt 0) {
                        $completeCount++
                    }
                }
            }
            
            $status = if ($completeCount -eq $totalCount) { "✅" } else { "❌" }
            Write-Host "    $status $($set.BaseName): $completeCount/$totalCount 个分卷" -ForegroundColor $(if ($completeCount -eq $totalCount) { "Green" } else { "Red" })
            
            if ($completeCount -ne $totalCount) {
                $allComplete = $false
            }
        }
        
        if ($finalTempFiles.Count -gt 0) {
            Write-Host "    ⚠️  仍有 $($finalTempFiles.Count) 个RAR临时文件" -ForegroundColor Yellow
            $allComplete = $false
        }
        
        if ($allComplete) {
            Write-Host "  ⚡ 超时但RAR分卷文件已就绪" -ForegroundColor Cyan
            return @{
                Success = $true
                VolumeSets = $finalVolumeSets
            }
        }
    }
    
    return @{
        Success = $false
        VolumeSets = $finalVolumeSets
    }
}

# 文件大小格式化函数
function Format-FileSize {
    param([long]$size)
    
    if ($size -ge 1GB) {
        return "{0:N2} GB" -f ($size / 1GB)
    } elseif ($size -ge 1MB) {
        return "{0:N2} MB" -f ($size / 1MB)
    } elseif ($size -ge 1KB) {
        return "{0:N2} KB" -f ($size / 1KB)
    } else {
        return "$size B"
    }
}

# 执行监控
$downloadResult = Monitor-RARVolumeSets

Write-Host "`n🔓 第3步：自动解压RAR分卷文件..." -ForegroundColor Yellow

# 自动解压任意RAR分卷组
function Auto-UnzipRARVolumeSets {
    param($VolumeSets)
    
    Write-Host "  ⚙️  开始自动解压流程..." -ForegroundColor Cyan
    $overallSuccess = $true
    
    # 如果没有检测到分卷组
    if ($VolumeSets.Count -eq 0) {
        Write-Host "  🔍 未找到RAR分卷文件" -ForegroundColor Yellow
        return $false
    }
    
    foreach ($key in $VolumeSets.Keys) {
        $set = $VolumeSets[$key]
        
        Write-Host "`n  📦 处理分卷组: $($set.BaseName)" -ForegroundColor Cyan
        
        # 1. 验证文件完整性
        Write-Host "  🔍 验证文件完整性..." -ForegroundColor Gray
        
        $allValid = $true
        foreach ($volume in $set.Volumes) {
            try {
                # 使用原始文件名
                $file = Get-Item $volume.OriginalFileName -ErrorAction Stop
                if ($file.Length -eq 0) {
                    Write-Host "    ❌ $($volume.OriginalFileName): 大小为0，无效文件" -ForegroundColor Red
                    $allValid = $false
                } else {
                    Write-Host "    ✓ $($volume.OriginalFileName): $(Format-FileSize $file.Length)" -ForegroundColor Gray
                }
            }
            catch {
                Write-Host "    ❌ 无法读取文件: $($volume.OriginalFileName)" -ForegroundColor Red
                $allValid = $false
            }
        }
        
        if (-not $allValid) {
            Write-Host "  ⚠️  跳过此分卷组，文件不完整" -ForegroundColor Yellow
            $overallSuccess = $false
            continue
        }
        
        # 2. 查找解压工具
        Write-Host "  🔧 查找解压工具..." -ForegroundColor Gray
        $unzipTool = $null
        $toolName = ""
        $toolArgs = ""
        
        # 检查WinRAR
        $winrarPaths = @(
            "${env:ProgramFiles}\WinRAR\WinRAR.exe",
            "${env:ProgramFiles(x86)}\WinRAR\WinRAR.exe"
        )
        
        foreach ($path in $winrarPaths) {
            if (Test-Path $path) {
                $unzipTool = $path
                $toolName = "WinRAR"
                # 使用第一个分卷文件（原始文件名）
                $firstVolume = $set.Volumes[0].OriginalFileName
                $toolArgs = "x -ibck -y `"$firstVolume`""
                break
            }
        }
        
        # 检查7-Zip
        if (-not $unzipTool) {
            $7zipPaths = @(
                "${env:ProgramFiles}\7-Zip\7z.exe",
                "${env:ProgramFiles(x86)}\7-Zip\7z.exe"
            )
            
            foreach ($path in $7zipPaths) {
                if (Test-Path $path) {
                    $unzipTool = $path
                    $toolName = "7-Zip"
                    $firstVolume = $set.Volumes[0].OriginalFileName
                    $toolArgs = "x `"$firstVolume`" -y"
                    break
                }
            }
        }
        
        # 检查PATH环境变量
        if (-not $unzipTool) {
            $commands = @("WinRAR", "7z", "unrar")
            foreach ($cmd in $commands) {
                try {
                    $commandInfo = Get-Command $cmd -ErrorAction Stop
                    $unzipTool = $commandInfo.Source
                    $toolName = $commandInfo.Name
                    $firstVolume = $set.Volumes[0].OriginalFileName
                    
                    if ($toolName -eq "WinRAR") {
                        $toolArgs = "x -ibck -y `"$firstVolume`""
                    } else {
                        $toolArgs = "x `"$firstVolume`" -y"
                    }
                    break
                }
                catch {
                    continue
                }
            }
        }
        
        if (-not $unzipTool) {
            Write-Host "  ❌ 未找到解压工具 (需要 WinRAR 或 7-Zip)" -ForegroundColor Red
            Write-Host "  请手动解压: 右键点击第一个分卷文件 -> '解压到当前文件夹'" -ForegroundColor Gray
            $overallSuccess = $false
            continue
        }
        
        Write-Host "  ✅ 找到: $toolName" -ForegroundColor Green
        
        # 3. 执行解压
        Write-Host "  🚀 正在解压分卷文件，请稍候..." -ForegroundColor Cyan
        Write-Host "  使用文件: $($set.Volumes[0].OriginalFileName)" -ForegroundColor Gray
        Write-Host "  命令: $toolName $toolArgs" -ForegroundColor DarkGray
        
        try {
            # 执行解压命令
            $process = Start-Process -FilePath $unzipTool -ArgumentList $toolArgs -NoNewWindow -PassThru -Wait
            
            if ($process.ExitCode -eq 0) {
                Write-Host "  ✅ $($set.BaseName) 解压完成 (退出代码: 0)" -ForegroundColor Green
                
                # 5. 自动删除压缩包
                Write-Host "  🗑️  自动清理RAR分卷文件..." -ForegroundColor Gray
                try {
                    foreach ($volume in $set.Volumes) {
                        Remove-Item $volume.OriginalFileName -ErrorAction Stop -Force
                        Write-Host "    ✓ 已删除: $($volume.OriginalFileName)" -ForegroundColor DarkGray
                    }
                    Write-Host "  ✅ 所有分卷文件已删除" -ForegroundColor Green
                }
                catch {
                    Write-Host "  ⚠️  无法删除RAR分卷文件: $_" -ForegroundColor Yellow
                    Write-Host "  请手动删除相关RAR文件" -ForegroundColor Gray
                }
                
            } else {
                Write-Host "  ⚠️  $($set.BaseName) 解压完成但有警告 (退出代码: $($process.ExitCode))" -ForegroundColor Yellow
                $overallSuccess = $false
            }
        }
        catch {
            Write-Host "  ❌ $($set.BaseName) 解压失败: $_" -ForegroundColor Red
            $overallSuccess = $false
            continue
        }
    }
    
    return $overallSuccess
}

# 智能解压控制
function Invoke-SmartUnzipAll {
    Write-Host "`n🔓 RAR分卷文件解压控制..." -ForegroundColor Yellow
    
    if ($downloadResult.Success -and $downloadResult.VolumeSets.Count -gt 0) {
        Write-Host "  ✅ RAR分卷文件下载完成，开始自动解压" -ForegroundColor Green
        Write-Host "  检测到 $($downloadResult.VolumeSets.Count) 个分卷组" -ForegroundColor Gray
        return Auto-UnzipRARVolumeSets $downloadResult.VolumeSets
    }
    
    # 直接检查当前状态
    Write-Host "  🔍 直接检查RAR分卷文件状态..." -ForegroundColor Cyan
    $currentVolumeSets = Find-RARVolumeSets
    
    if ($currentVolumeSets.Count -eq 0) {
        Write-Host "  🔎 未检测到RAR分卷文件" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "  检测到 $($currentVolumeSets.Count) 个分卷组:" -ForegroundColor Gray
    
    $allReady = $true
    foreach ($key in $currentVolumeSets.Keys) {
        $set = $currentVolumeSets[$key]
        $completeCount = 0
        
        foreach ($volume in $set.Volumes) {
            # 使用原始文件名检查
            if (Test-Path $volume.OriginalFileName) {
                $file = Get-Item $volume.OriginalFileName -ErrorAction SilentlyContinue
                if ($file -and $file.Length -gt 0) {
                    $completeCount++
                }
            }
        }
        
        $status = if ($completeCount -eq $set.Volumes.Count) { "✅" } else { "❌" }
        Write-Host "    $status $($set.BaseName): $completeCount/$($set.Volumes.Count) 个分卷" -ForegroundColor $(if ($completeCount -eq $set.Volumes.Count) { "Green" } else { "Red" })
        
        if ($completeCount -ne $set.Volumes.Count) {
            $allReady = $false
        }
    }
    
    # 只检查RAR相关临时文件
    $rarTempFiles = Get-RARTempFiles
    
    if ($rarTempFiles.Count -gt 0) {
        Write-Host "  ⚠️  发现 $($rarTempFiles.Count) 个RAR相关临时文件" -ForegroundColor Yellow
        $allReady = $false
    }
    
    if ($allReady) {
        Write-Host "  ✅ RAR分卷文件就绪，开始解压" -ForegroundColor Green
        return Auto-UnzipRARVolumeSets $currentVolumeSets
    } else {
        Write-Host "  ⚠️  RAR分卷文件不满足解压条件" -ForegroundColor Yellow
        return $false
    }
}

# 执行智能解压
$unzipResult = Invoke-SmartUnzipAll

Write-Host "`n📋 最终状态报告：" -ForegroundColor Cyan

if ($unzipResult) {
    Write-Host "  ✅ 所有RAR分卷文件已自动解压并清理" -ForegroundColor Green
    Write-Host "  💻 可以安装提取出的文件" -ForegroundColor Blue
} else {
    Write-Host "  ⚠️  RAR分卷文件需要手动处理" -ForegroundColor Yellow
    Write-Host "  请确保所有RAR分卷文件都已下载完成" -ForegroundColor White
    Write-Host "  然后手动解压第一个分卷文件" -ForegroundColor White
}

Write-Host "  📥 EXE文件在浏览器中继续下载（不受监控）..." -ForegroundColor Blue
Write-Host "    • Firefox Setup 147.0.1.exe (浏览器)" -ForegroundColor Gray
Write-Host "    • Git-2.52.0-64-bit.exe (版本控制)" -ForegroundColor Gray

Write-Host "`n📍 文件位置信息：" -ForegroundColor Cyan
Write-Host "  当前目录: $(Get-Location)" -ForegroundColor Gray

Write-Host "`n🔄 RAR分卷监控解压流程已完成" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  窗口操作说明：" -ForegroundColor Cyan
Write-Host "  • 关闭窗口: 点击右上角 X 按钮" -ForegroundColor White
Write-Host "  • 复制文本: Ctrl+C" -ForegroundColor White
Write-Host "  • 全选文本: Ctrl+A" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Write-Host "`n✅ 脚本执行完毕！" -ForegroundColor Green
Write-Host "   请手动关闭此窗口" -ForegroundColor Yellow
Write-Host "   🎉 祝你开发顺利！🚀" -ForegroundColor Magenta

Write-Host "`n  ⚠️  所有键盘快捷键将被忽略" -ForegroundColor Yellow
Write-Host "  （包括 Ctrl+C, Ctrl+A, Ctrl+V 等）" -ForegroundColor DarkGray
Write-Host "  请使用鼠标操作右上角关闭窗口" -ForegroundColor DarkGray

# 完全禁用所有按键响应，进入空闲状态
Write-Host "`n  ✅ 进入空闲状态，等待手动关闭..." -ForegroundColor Green

# 简单的无限循环保持窗口打开，但清空所有按键输入
while ($true) {
    # 静默清空所有未处理的按键
    if ($Host.UI.RawUI.KeyAvailable) {
        # 读取并丢弃所有按键（不显示）
        try {
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown,IncludeKeyUp")
        } catch {
            # 忽略所有错误
        }
    }
    
    # 低CPU占用的休眠
    Start-Sleep -Milliseconds 500
}