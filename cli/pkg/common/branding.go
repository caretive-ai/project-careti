package common

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

const (
	// defaultBrandDisplayName is used if package.json cannot be read.
	defaultBrandDisplayName = "Caret"
	// BrandSlug is a lowercase identifier used in log file names.
	BrandSlug = "caret"
	// ConfigDirName sets the root config directory (shared across caret/cline binaries).
	ConfigDirName = ".caret"
	// SupportURL should point to the Caret issue tracker.
	SupportURL = "https://github.com/aicoding-caret/caret/issues"
)

var (
	brandDisplayNameOnce sync.Once
	brandDisplayName     = defaultBrandDisplayName
)

// CARET MODIFICATION: resolve brand display name from nearest package.json (install root), fallback to default.
func BrandDisplayName() string {
	brandDisplayNameOnce.Do(func() {
		if name := readBrandFromPackageJSON(); name != "" {
			brandDisplayName = name
		}
	})
	return brandDisplayName
}

func readBrandFromPackageJSON() string {
	execPath, err := os.Executable()
	if err != nil {
		return ""
	}
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

// CARET MODIFICATION: centralized brand/config helpers for caret CLI.
func DefaultConfigPath() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(homeDir, ConfigDirName), nil
}

// CARET MODIFICATION: shared logs dir helper for caret CLI.
func LogsDir(configPath string) string {
	return filepath.Join(configPath, "logs")
}
