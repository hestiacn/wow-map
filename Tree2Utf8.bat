@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "folder=%~1"
if "%folder%"=="" set "folder=%CD%"
set "out=%folder%\目录树.txt"
set "exclude=node_modules"

echo 正在扫描 %folder% （已排除 %exclude%）...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue';" ^
    "$excluded = '%exclude%';" ^
    "function Get-DirTree {" ^
        "param($Path, $Prefix='');" ^
        "$items = Get-ChildItem -LiteralPath $Path -Force | Where-Object { $_.Name -ne $excluded };" ^
        "$dirs = @($items | Where-Object { $_.PSIsContainer });" ^
        "$files = @($items | Where-Object { -not $_.PSIsContainer });" ^
        "$all = $dirs + $files;" ^
        "for ($i=0; $i -lt $all.Count; $i++) {" ^
            "$item = $all[$i];" ^
            "$isLast = ($i -eq $all.Count-1);" ^
            "$Prefix + $(if ($isLast) {'└── '} else {'├── '}) + $item.Name;" ^
            "if ($item.PSIsContainer) {" ^
                "$newPref = $Prefix + $(if ($isLast) {'    '} else {'│   '});" ^
                "Get-DirTree -Path $item.FullName -Prefix $newPref;" ^
            "}" ^
        "}" ^
    "};" ^
    "Get-DirTree -Path '%folder%' | Out-File -Encoding utf8 -FilePath '%out%';" ^
    "Add-Content -Path '%out%' -Value '';" ^
    "Add-Content -Path '%out%' -Value '[扫描目录]%folder%' -Encoding UTF8;"

if exist "%out%" (
    echo 完成！结果已保存到：
    echo %out%
) else (
    echo 错误：生成文件失败。
)
pause