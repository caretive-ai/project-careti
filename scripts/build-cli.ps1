<# 
// CARETI MODIFICATION: Windows PowerShell build script for Caret CLI binaries.
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

$cliDir = Join-Path $Root "cli"
$binDir = Join-Path $cliDir "bin"
New-Item -ItemType Directory -Force -Path $binDir | Out-Null

Write-Host "Building Caret CLI for windows/amd64..."

$env:GO111MODULE = "on"
$env:GOOS = "windows"
$env:GOARCH = "amd64"

Write-Host "Running proto generation..."
npm run protos
if ($LASTEXITCODE -ne 0) { throw "npm run protos failed." }
npm run protos-go
if ($LASTEXITCODE -ne 0) { throw "npm run protos-go failed." }

Push-Location $cliDir
try {
	go build -ldflags $ldflags -o (Join-Path $binDir "careti.exe") ./cmd/cline
	if ($LASTEXITCODE -ne 0) { throw "go build failed for careti.exe" }
	go build -ldflags $ldflags -o (Join-Path $binDir "careti-host.exe") ./cmd/cline-host
	if ($LASTEXITCODE -ne 0) { throw "go build failed for careti-host.exe" }
} finally {
	Pop-Location
}

Write-Host "Build complete."

$distBin = Join-Path $Root "dist-standalone\\bin"
New-Item -ItemType Directory -Force -Path $distBin | Out-Null

Remove-Item -Path (Join-Path $distBin "cline*") -Force -ErrorAction SilentlyContinue
Remove-Item -Path (Join-Path $distBin "caret*") -Force -ErrorAction SilentlyContinue

$os = "windows"
$arch = "amd64"

Copy-Item -Path (Join-Path $binDir "careti.exe") -Destination (Join-Path $distBin "careti.exe") -Force
Copy-Item -Path (Join-Path $binDir "careti.exe") -Destination (Join-Path $distBin "careti-$os-$arch.exe") -Force
Copy-Item -Path (Join-Path $binDir "careti-host.exe") -Destination (Join-Path $distBin "careti-host.exe") -Force
Copy-Item -Path (Join-Path $binDir "careti-host.exe") -Destination (Join-Path $distBin "careti-host-$os-$arch.exe") -Force
# CARETI MODIFICATION: keep cline aliases for legacy packaging scripts.
Copy-Item -Path (Join-Path $binDir "careti.exe") -Destination (Join-Path $distBin "cline.exe") -Force
Copy-Item -Path (Join-Path $binDir "careti.exe") -Destination (Join-Path $distBin "cline-$os-$arch.exe") -Force
Copy-Item -Path (Join-Path $binDir "careti-host.exe") -Destination (Join-Path $distBin "cline-host.exe") -Force
Copy-Item -Path (Join-Path $binDir "careti-host.exe") -Destination (Join-Path $distBin "cline-host-$os-$arch.exe") -Force

Write-Host "Copied binaries to dist-standalone\\bin (Caret naming)."
