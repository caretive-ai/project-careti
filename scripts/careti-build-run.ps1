<# 
// CARETI MODIFICATION: Windows PowerShell build+run script for Caret CLI.
#>
[CmdletBinding()]
param(
	[AllowNull()]
	[string]$Root,
	[AllowNull()]
	[string]$SubstDrive,
	[AllowNull()]
	[string]$LogPath
)

$ErrorActionPreference = "Stop"
$SubstDrive = if ($SubstDrive) { $SubstDrive } else { $env:CARET_SUBST_DRIVE }
$LogPath = if ($LogPath) { $LogPath } else { $env:CARET_LOG_PATH }

function Get-RootPath {
	if ($Root) {
		return (Resolve-Path $Root).Path
	}
	$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } elseif ($PSCommandPath) { Split-Path -Parent $PSCommandPath } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { $null }
	if (-not $scriptDir) { return $null }
	return (Resolve-Path (Join-Path $scriptDir "..")).Path
}

function Get-HomeDir {
	if ($env:USERPROFILE) { return $env:USERPROFILE }
	if ($env:HOME) { return $env:HOME }
	return $HOME
}

function ShouldUseSubst([string]$pathValue) {
	if ($SubstDrive) { return $true }
	if ($pathValue -match "[^\x00-\x7F]") { return $true }
	if ($pathValue -match "[()]") { return $true }
	return $false
}

function Ensure-SubstDrive([string]$targetPath) {
	$drive = $SubstDrive
	if (-not $drive) { $drive = "X" }
	$drive = $drive.TrimEnd(":")
	if (-not (Get-PSDrive -Name $drive -ErrorAction SilentlyContinue)) {
		cmd /c ("subst {0}: `"{1}`"" -f $drive, $targetPath) | Out-Null
	}
	return ("{0}:\\" -f $drive)
}

function Ensure-Protoc([string]$baseRoot) {
	if (-not $env:PROTOC) {
		$candidate = Join-Path $baseRoot "tools\\protoc-25.3\\bin\\protoc.exe"
		if (Test-Path $candidate) {
			$env:PROTOC = $candidate
		}
	}
}

function Invoke-Npm([string]$npmArgs) {
	Write-Host "npm $npmArgs"
	cmd /c "npm $npmArgs"
	if ($LASTEXITCODE -ne 0) {
		throw "npm $npmArgs failed with exit code $LASTEXITCODE"
	}
}

function Ensure-WebviewDeps([string]$baseRoot) {
	if ($env:CARET_SKIP_WEBVIEW_INSTALL) {
		return
	}
	$webviewDir = Join-Path $baseRoot "webview-ui"
	if (-not (Test-Path $webviewDir)) {
		Write-Host "[warn] webview-ui not found; skipping webview dependency check"
		return
	}
	$tsPkg = Join-Path $webviewDir "node_modules\\typescript\\package.json"
	if (Test-Path $tsPkg) {
		return
	}
	Write-Host "[info] webview-ui dependencies missing; running npm install --include=dev"
	Push-Location $webviewDir
	try {
		$env:NPM_CONFIG_PRODUCTION = "false"
		cmd /c "npm install --include=dev"
		if ($LASTEXITCODE -ne 0) {
			throw "npm install failed in webview-ui"
		}
	} finally {
		Pop-Location
	}
	if (-not (Test-Path $tsPkg)) {
		throw "typescript still missing after npm install"
	}
}

function Invoke-CompileStandalone {
	Invoke-Npm "run check-types:backend"
	Invoke-Npm "run check-types:frontend"
	cmd /c "npx biome lint --no-errors-on-unmatched --files-ignore-unknown=true --diagnostic-level=error"
	if ($LASTEXITCODE -ne 0) {
		throw "biome lint failed"
	}
	cmd /c "node scripts\\proto-lint.mjs"
	if ($LASTEXITCODE -ne 0) {
		throw "proto lint failed"
	}
	cmd /c "node esbuild.mjs --standalone"
	if ($LASTEXITCODE -ne 0) {
		throw "esbuild standalone failed"
	}
}

function Ensure-ExtensionPackage([string]$baseRoot) {
	$extDir = Join-Path $baseRoot "dist-standalone\\extension"
	New-Item -ItemType Directory -Force -Path $extDir | Out-Null
	$packageSrc = Join-Path $baseRoot "package.json"
	$packageDest = Join-Path $extDir "package.json"
	if (Test-Path $packageSrc) {
		Copy-Item -Force -Path $packageSrc -Destination $packageDest
	}
}

function Stop-CaretProcesses {
	$names = @("careti-host", "cline-host", "cline-core", "careti-core", "careti")
	foreach ($name in $names) {
		try {
			Get-Process -Name $name -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
		} catch {
			# ignore
		}
	}
}

$resolvedRoot = Get-RootPath
if (-not $resolvedRoot) {
	throw "Root path could not be resolved. Pass -Root with the repo path."
}
$buildRoot = $resolvedRoot

if (ShouldUseSubst $resolvedRoot) {
	$buildRoot = Ensure-SubstDrive $resolvedRoot
}

Ensure-Protoc $buildRoot

$homeDir = Get-HomeDir
$env:PATH = "$($buildRoot)dist-standalone\bin;$env:PATH"
$env:GOCACHE = Join-Path $buildRoot ".cache\\go-build"
if (-not $env:CARET_FORCE_KILL) {
	$env:CARET_FORCE_KILL = "1"
}

$LogPath = if ($LogPath) { $LogPath } else { Join-Path $buildRoot ("logs\\careti-build-run-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss")) }
$logDir = Split-Path -Parent $LogPath
if ($logDir) {
	New-Item -ItemType Directory -Force -Path $logDir | Out-Null
}
$transcriptStarted = $false
try {
	Start-Transcript -Path $LogPath -Append | Out-Null
	$transcriptStarted = $true
} catch {
	Write-Host "[warn] Failed to start transcript logging; continuing"
}

try {
	Push-Location $buildRoot
	try {
		if (-not $env:CARET_SKIP_KILL) {
			Stop-CaretProcesses
			if ($homeDir) {
				Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $homeDir ".caret\\locks.db")
				Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $homeDir ".cline\\locks.db")
			} else {
				Write-Host "[warn] HOME directory not resolved; skipping lock cleanup"
			}
		} else {
			Write-Host "[info] CARET_SKIP_KILL set; keeping existing host/core processes running during rebuild"
		}

		Invoke-Npm "run protos"
		Invoke-Npm "run protos-go"
		Invoke-Npm "rebuild better-sqlite3"
		Ensure-WebviewDeps $buildRoot

		powershell -ExecutionPolicy Bypass -File "scripts\\build-cli.ps1" -Root $buildRoot
		if ($LASTEXITCODE -ne 0) { throw "build-cli.ps1 failed." }

		Invoke-CompileStandalone
		Invoke-Npm "run postcompile-standalone"
		Ensure-ExtensionPackage $buildRoot
	} finally {
		Pop-Location
	}
} finally {
	if ($transcriptStarted) {
		Stop-Transcript | Out-Null
	}
}

$caretExe = Join-Path $buildRoot "dist-standalone\\bin\\careti.exe"
if ($args.Count -eq 0) {
	& $caretExe
} else {
	& $caretExe @args
}
