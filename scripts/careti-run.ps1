<# 
// CARETI MODIFICATION: Windows PowerShell run script for Caret CLI (no rebuild).
#>
[CmdletBinding()]
param(
	[AllowNull()]
	[string]$Root,
	[AllowNull()]
	[string]$SubstDrive
)

$ErrorActionPreference = "Stop"
$SubstDrive = if ($SubstDrive) { $SubstDrive } else { $env:CARET_SUBST_DRIVE }

function Get-RootPath {
	if ($Root) {
		return (Resolve-Path $Root).Path
	}
	$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } elseif ($PSCommandPath) { Split-Path -Parent $PSCommandPath } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { $null }
	if (-not $scriptDir) { return $null }
	return (Resolve-Path (Join-Path $scriptDir "..")).Path
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

$env:PATH = "$($buildRoot)dist-standalone\bin;$env:PATH"

if (-not $env:CARET_SKIP_KILL) {
	Stop-CaretProcesses
} else {
	Write-Host "[info] CARET_SKIP_KILL set; skipping host/core shutdown before run"
}

$caretExe = Join-Path $buildRoot "dist-standalone\\bin\\careti.exe"
if ($args.Count -eq 0) {
	& $caretExe
} else {
	& $caretExe @args
}
