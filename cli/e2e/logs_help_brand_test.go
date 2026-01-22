package e2e

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestLogsPathHelpUsesBrandName(t *testing.T) {
	t.Helper()

	bin := buildTempCaretBinary(t)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	out, err := exec.CommandContext(ctx, bin, "logs", "path", "--help").CombinedOutput()
	if err != nil {
		t.Fatalf("caret logs path --help failed: %v\n%s", err, out)
	}

	output := string(out)
	if !strings.Contains(output, "Caret logs directory") {
		t.Fatalf("expected Caret branding in help output, got:\n%s", output)
	}
	if strings.Contains(output, "Cline logs directory") {
		t.Fatalf("unexpected Cline branding in help output, got:\n%s", output)
	}
}

func buildTempCaretBinary(t *testing.T) string {
	t.Helper()

	tempDir := t.TempDir()
	binPath := filepath.Join(tempDir, "careti")

	wd, err := os.Getwd()
	if err != nil {
		t.Fatalf("Getwd error: %v", err)
	}
	repoRoot := filepath.Clean(filepath.Join(wd, "..", ".."))

	cmd := exec.Command("go", "build", "-o", binPath, "./cli/cmd/cline")
	cmd.Dir = repoRoot
	cmd.Env = os.Environ()
	if out, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("go build caret CLI failed: %v\n%s", err, out)
	}

	return binPath
}
