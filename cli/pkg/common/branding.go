package common

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

const (
	// defaultBrandDisplayName is used if package.json cannot be read.
	defaultBrandDisplayName = "Caret"
	// CARET MODIFICATION: CLI parity mode env flag.
	clineParityEnvVar = "CARET_CLINE_PARITY"
)

var (
	brandDisplayNameOnce sync.Once
	brandDisplayName     = defaultBrandDisplayName
	brandOverrideName    string
	brandOverrideSlug    string
	brandOverrideSet     bool

	npmPackageNameOnce sync.Once
	npmPackageName     string

	supportURLOnce sync.Once
	supportURL     string
)

// CARET MODIFICATION: enable Cline parity brand override for CLI-only validation.
func EnableClineParity() {
	setBrandOverride("Cline")
}

// CARET MODIFICATION: check if Cline parity is enabled.
func IsClineParityEnabled() bool {
	applyEnvBrandOverride()
	return brandOverrideSlug == "cline"
}

// CARET MODIFICATION: apply env-based brand override once per process.
func applyEnvBrandOverride() {
	if brandOverrideSet {
		return
	}
	if os.Getenv(clineParityEnvVar) != "" {
		setBrandOverride("Cline")
	}
}

// CARET MODIFICATION: set brand override name/slug (CLI-only).
func setBrandOverride(displayName string) {
	name := strings.TrimSpace(displayName)
	if name == "" {
		return
	}
	brandOverrideName = name
	brandOverrideSlug = toBrandSlug(name)
	brandOverrideSet = true
}

// CARET MODIFICATION: convert a display name into a safe slug ("CodeCenter" -> "codecenter")
func toBrandSlug(displayName string) string {
	s := strings.TrimSpace(strings.ToLower(displayName))
	if s == "" {
		return "caret"
	}
	s = strings.Join(strings.Fields(s), "-")
	var b strings.Builder
	b.Grow(len(s))
	lastDash := false
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
			lastDash = false
			continue
		}
		if r == '-' && !lastDash {
			b.WriteRune('-')
			lastDash = true
		}
	}
	out := strings.Trim(b.String(), "-")
	if out == "" {
		return "caret"
	}
	return out
}

// CARET MODIFICATION: brand slug for CLI command/log/config paths (white-label capable)
func BrandSlug() string {
	applyEnvBrandOverride()
	if brandOverrideSet && brandOverrideSlug != "" {
		return brandOverrideSlug
	}
	return toBrandSlug(BrandDisplayName())
}

// CARET MODIFICATION: config dir name derived from current brand (e.g., ".caret", ".codecenter")
func ConfigDirName() string {
	return "." + BrandSlug()
}

// CARET MODIFICATION: CLI command name derived from brand slug (e.g., "caret", "codecenter")
func CliCommandName() string {
	return BrandSlug()
}

// CARET MODIFICATION: CLI host command name derived from brand slug (e.g., "caret-host", "codecenter-host")
func CliHostCommandName() string {
	return BrandSlug() + "-host"
}

// CARET MODIFICATION: compute ignore filename based on current brand (default ".caretignore")
func BrandIgnoreFileName() string {
	return fmt.Sprintf(".%signore", BrandSlug())
}

// CARET MODIFICATION: resolve brand display name from nearest package.json (install root), fallback to default.
func BrandDisplayName() string {
	applyEnvBrandOverride()
	if brandOverrideSet && brandOverrideName != "" {
		return brandOverrideName
	}
	brandDisplayNameOnce.Do(func() {
		execPath, err := os.Executable()
		if err != nil {
			brandDisplayName = defaultBrandDisplayName
			return
		}
		if name := readBrandFromPackageJSON(execPath); name != "" {
			brandDisplayName = name
			return
		}
		if resolved := ResolveBrandNameForPath(execPath); resolved != "" {
			brandDisplayName = resolved
		}
	})
	return brandDisplayName
}

// CARET MODIFICATION: resolve npm package name from nearest package.json, fallback to @caretive/<brandSlug>-cli.
func NpmPackageName() string {
	applyEnvBrandOverride()
	if brandOverrideSet && brandOverrideSlug != "" {
		if brandOverrideSlug == "cline" {
			return "cline"
		}
		return fmt.Sprintf("@caretive/%s-cli", brandOverrideSlug)
	}
	npmPackageNameOnce.Do(func() {
		execPath, err := os.Executable()
		if err == nil {
			if name := readNpmPackageNameFromPackageJSON(execPath); name != "" {
				// CARET MODIFICATION: avoid accidentally treating repo-local cli/package.json ("cline")
				// as the update target for non-cline branded binaries.
				if name == "cline" && BrandSlug() != "cline" {
					// ignore and fall back to the brand-scoped package name
				} else {
					npmPackageName = name
					return
				}
			}
		}

		npmPackageName = fmt.Sprintf("@caretive/%s-cli", BrandSlug())
	})
	return npmPackageName
}

// CARET MODIFICATION: helper for showing a consistent install command in user-facing output.
func NpmInstallCommand(channel string) string {
	pkg := NpmPackageName()
	if channel == "nightly" {
		pkg = pkg + "@nightly"
	}
	return "npm install -g " + pkg
}

// CARET MODIFICATION: resolve support URL from package.json (bugs.url or derived GitHub issues URL).
func SupportURL() string {
	supportURLOnce.Do(func() {
		execPath, err := os.Executable()
		if err != nil {
			supportURL = ""
			return
		}
		supportURL = readSupportURLFromPackageJSON(execPath)
	})
	return supportURL
}

func readBrandFromPackageJSON(execPath string) string {
	dir := filepath.Dir(execPath)
	// Walk up to 4 levels to find package.json (npm global or repo layout).
	for i := 0; i < 4; i++ {
		pkgPath := filepath.Join(dir, "package.json")
		if data, err := os.ReadFile(pkgPath); err == nil {
			var pkg struct {
				DisplayName string `json:"displayName"`
			}
			if err := json.Unmarshal(data, &pkg); err == nil && pkg.DisplayName != "" {
				return pkg.DisplayName
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return ""
}

func readNpmPackageNameFromPackageJSON(execPath string) string {
	dir := filepath.Dir(execPath)
	for i := 0; i < 4; i++ {
		pkgPath := filepath.Join(dir, "package.json")
		if data, err := os.ReadFile(pkgPath); err == nil {
			var pkg struct {
				Name string `json:"name"`
			}
			if err := json.Unmarshal(data, &pkg); err == nil && pkg.Name != "" {
				return pkg.Name
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return ""
}

func readSupportURLFromPackageJSON(execPath string) string {
	dir := filepath.Dir(execPath)
	for i := 0; i < 4; i++ {
		pkgPath := filepath.Join(dir, "package.json")
		if data, err := os.ReadFile(pkgPath); err == nil {
			var pkg struct {
				Bugs struct {
					URL string `json:"url"`
				} `json:"bugs"`
				Repository struct {
					URL string `json:"url"`
				} `json:"repository"`
			}
			if err := json.Unmarshal(data, &pkg); err == nil {
				if pkg.Bugs.URL != "" {
					return pkg.Bugs.URL
				}
				if derived := deriveGitHubIssuesURL(pkg.Repository.URL); derived != "" {
					return derived
				}
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return ""
}

func deriveGitHubIssuesURL(repoURL string) string {
	repoURL = strings.TrimSpace(repoURL)
	if repoURL == "" {
		return ""
	}
	repoURL = strings.TrimPrefix(repoURL, "git+")
	repoURL = strings.TrimSuffix(repoURL, ".git")
	if !strings.HasPrefix(repoURL, "https://github.com/") {
		return ""
	}
	return strings.TrimRight(repoURL, "/") + "/issues"
}

// CARET MODIFICATION: centralized brand/config helpers for caret CLI.
func DefaultConfigPath() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(homeDir, ConfigDirName()), nil
}

// CARET MODIFICATION: shared logs dir helper for caret CLI.
func LogsDir(configPath string) string {
	return filepath.Join(configPath, "logs")
}

// ResolveBrandNameForPath infers the correct brand label from the binary path.
func ResolveBrandNameForPath(execPath string) string {
	if execPath == "" {
		return defaultBrandDisplayName
	}

	base := strings.ToLower(filepath.Base(execPath))
	switch {
	case strings.Contains(base, "cline"):
		return "Cline"
	case strings.Contains(base, "caret"):
		return "Caret"
	default:
		return defaultBrandDisplayName
	}
}
