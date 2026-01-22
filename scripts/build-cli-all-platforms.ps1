<# 
// CARETI MODIFICATION: Windows PowerShell build script for Caret CLI (all platforms).
#>
[CmdletBinding()]
param(
	[string]$Root
)

$ErrorActionPreference = "Stop"

if (-not $Root) {
	$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
	$Root = (Resolve-Path (Join-Path $scriptDir "..")).Path
}

$protocCandidate = Join-Path $Root "tools\\protoc-25.3\\bin\\protoc.exe"
if (-not $env:PROTOC -and (Test-Path $protocCandidate)) {
	$env:PROTOC = $protocCandidate
}

function Get-JsonValue {
	param(
		[string]$FilePath,
		[string]$PropertyName
	)
	$value = node -p "require(process.argv[1]).$PropertyName" -- $FilePath
	return $value.Trim()
}

$goExe = Get-Command go -ErrorAction SilentlyContinue
if (-not $goExe) {
	throw "Go not found in PATH. Install Go and reopen PowerShell."
}

$coreVersion = Get-JsonValue -FilePath (Join-Path $Root "package.json") -PropertyName "version"
$cliVersion = Get-JsonValue -FilePath (Join-Path $Root "cli\\package.json") -PropertyName "version"
$commit = "unknown"
try {
	$commit = (git -C $Root rev-parse --short HEAD 2>$null).Trim()
	if (-not $commit) { $commit = "unknown" }
} catch {
	$commit = "unknown"
}
$date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$builtBy = if ($env:USERNAME) { $env:USERNAME } else { "unknown" }

$ldflags = "-X 'github.com/cline/cli/pkg/cli/global.Version=$coreVersion' " +
	"-X 'github.com/cline/cli/pkg/cli/global.CliVersion=$cliVersion' " +
	"-X 'github.com/cline/cli/pkg/cli/global.Commit=$commit' " +
	"-X 'github.com/cline/cli/pkg/cli/global.Date=$date' " +
	"-X 'github.com/cline/cli/pkg/cli/global.BuiltBy=$builtBy'"

$targets = @(
	@{ OS = "windows"; Arch = "amd64"; Ext = ".exe" },
	@{ OS = "linux"; Arch = "amd64"; Ext = "" },
	@{ OS = "linux"; Arch = "arm64"; Ext = "" },
	@{ OS = "darwin"; Arch = "amd64"; Ext = "" },
	@{ OS = "darwin"; Arch = "arm64"; Ext = "" }
)

$cliDir = Join-Path $Root "cli"
$binDir = Join-Path $cliDir "bin"
New-Item -ItemType Directory -Force -Path $binDir | Out-Null

$env:GO111MODULE = "on"
$env:CGO_ENABLED = "0"

Write-Host "Running proto generation..."
npm run protos
if ($LASTEXITCODE -ne 0) { throw "npm run protos failed." }
npm run protos-go
if ($LASTEXITCODE -ne 0) { throw "npm run protos-go failed." }

$extDir = Join-Path $Root "dist-standalone\\extension"
New-Item -ItemType Directory -Force -Path $extDir | Out-Null
Copy-Item -Force -Path (Join-Path $Root "package.json") -Destination (Join-Path $extDir "package.json")

Push-Location $cliDir
try {
	foreach ($target in $targets) {
		$os = $target.OS
		$arch = $target.Arch
		$ext = $target.Ext

		Write-Host "Building Caret CLI for $os/$arch..."
		$env:GOOS = $os
		$env:GOARCH = $arch

		$outCli = Join-Path $binDir ("careti-{0}-{1}{2}" -f $os, $arch, $ext)
		$outHost = Join-Path $binDir ("careti-host-{0}-{1}{2}" -f $os, $arch, $ext)

		go build -ldflags $ldflags -o $outCli ./cmd/cline
		if ($LASTEXITCODE -ne 0) { throw "go build failed for $outCli" }
		go build -ldflags $ldflags -o $outHost ./cmd/cline-host
		if ($LASTEXITCODE -ne 0) { throw "go build failed for $outHost" }
	}
} finally {
	Pop-Location
}

$distBin = Join-Path $Root "dist-standalone\\bin"
New-Item -ItemType Directory -Force -Path $distBin | Out-Null

Remove-Item -Path (Join-Path $distBin "cline*") -Force -ErrorAction SilentlyContinue
Remove-Item -Path (Join-Path $distBin "caret*") -Force -ErrorAction SilentlyContinue

Get-ChildItem -Path $binDir -Filter "careti-*" | ForEach-Object {
	Copy-Item -Path $_.FullName -Destination (Join-Path $distBin $_.Name) -Force
}
Get-ChildItem -Path $binDir -Filter "careti-host-*" | ForEach-Object {
	Copy-Item -Path $_.FullName -Destination (Join-Path $distBin $_.Name) -Force
}

# CARETI MODIFICATION: keep cline aliases for legacy packaging scripts.
Get-ChildItem -Path $binDir -Filter "careti-*" | ForEach-Object {
	$clineName = $_.Name -replace "^careti-", "cline-"
	Copy-Item -Path $_.FullName -Destination (Join-Path $distBin $clineName) -Force
}
Get-ChildItem -Path $binDir -Filter "careti-host-*" | ForEach-Object {
	$clineName = $_.Name -replace "^careti-host-", "cline-host-"
	Copy-Item -Path $_.FullName -Destination (Join-Path $distBin $clineName) -Force
}

Write-Host "Copied multi-platform binaries to dist-standalone\\bin."
