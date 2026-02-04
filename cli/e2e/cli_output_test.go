// CARETI MODIFICATION: E2E tests for CLI output verification
package e2e

import (
	"context"
	"os/exec"
	"strings"
	"testing"
)

// TestHelpOutputNoDuplicates verifies help output has no duplicate lines
func TestHelpOutputNoDuplicates(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()
	lines := strings.Split(out, "\n")

	// Check for duplicate consecutive lines
	for i := 1; i < len(lines); i++ {
		if lines[i] != "" && lines[i] == lines[i-1] {
			t.Errorf("Duplicate consecutive line found: %q", lines[i])
		}
	}

	// Log full output for inspection
	t.Logf("Help output (%d lines):\n%s", len(lines), out)
}

// TestVersionOutputFormat verifies version output format
func TestVersionOutputFormat(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "version")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	err := cmd.Run()

	if err != nil {
		t.Fatalf("version command failed: %v", err)
	}

	out := outB.String()

	// Log full output for inspection
	t.Logf("Version output:\n%s", out)

	// Verify expected fields
	expectedFields := []string{
		"Careti CLI",
		"CLI Version",
		"Core Version",
		"Go version",
		"OS/Arch",
	}

	for _, field := range expectedFields {
		if !strings.Contains(out, field) {
			t.Errorf("Version output missing field %q", field)
		}
	}
}

// TestAuthHelpOutput verifies auth subcommand help
func TestAuthHelpOutput(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "auth", "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	err := cmd.Run()

	if err != nil {
		t.Fatalf("auth help failed: %v", err)
	}

	out := outB.String()
	t.Logf("Auth help output:\n%s", out)

	// Verify auth subcommand has expected content
	if !strings.Contains(out, "Authenticate") {
		t.Errorf("Auth help should mention 'Authenticate'")
	}
}

// TestConfigHelpOutput verifies config subcommand help
func TestConfigHelpOutput(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "config", "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	err := cmd.Run()

	if err != nil {
		t.Fatalf("config help failed: %v", err)
	}

	out := outB.String()
	t.Logf("Config help output:\n%s", out)
}

// TestTaskHelpOutput verifies task subcommand help
func TestTaskHelpOutput(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "task", "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	err := cmd.Run()

	if err != nil {
		t.Fatalf("task help failed: %v", err)
	}

	out := outB.String()
	t.Logf("Task help output:\n%s", out)

	// Verify task has list subcommand
	if !strings.Contains(out, "list") {
		t.Errorf("Task help should mention 'list' subcommand")
	}
}

// TestAllFlagsPresent verifies all expected flags are present
func TestAllFlagsPresent(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()

	expectedFlags := []struct {
		short string
		long  string
	}{
		{"-m", "--mode"},
		{"-p", "--persona"},
		{"-y", "--yolo"},
		{"-o", "--oneshot"},
		{"-v", "--verbose"},
		{"-f", "--file"},
		{"-i", "--image"},
		{"-F", "--output-format"},
	}

	for _, flag := range expectedFlags {
		if !strings.Contains(out, flag.short) {
			t.Errorf("Missing short flag: %s", flag.short)
		}
		if !strings.Contains(out, flag.long) {
			t.Errorf("Missing long flag: %s", flag.long)
		}
	}

	t.Logf("All flags check passed")
}

// TestInvalidFlagError verifies invalid flag returns error
func TestInvalidFlagError(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--invalid-flag-xyz")
	outB, errB := &strings.Builder{}, &strings.Builder{}
	cmd.Stdout = outB
	cmd.Stderr = errB
	err := cmd.Run()

	// Should fail with invalid flag
	if err == nil {
		t.Errorf("Expected error for invalid flag, but got success")
	}

	errOut := errB.String()
	t.Logf("Error output for invalid flag:\n%s", errOut)

	if !strings.Contains(errOut, "unknown flag") {
		t.Errorf("Error should mention 'unknown flag'")
	}
}

// TestModeValues verifies all mode values are documented
func TestModeValues(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()

	modes := []string{"act", "plan", "agent", "chatbot"}
	for _, mode := range modes {
		if !strings.Contains(out, mode) {
			t.Errorf("Mode %q not documented in help", mode)
		}
	}
}

// TestOutputFormatValues verifies output format values
func TestOutputFormatValues(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()

	formats := []string{"rich", "json", "plain"}
	for _, format := range formats {
		if !strings.Contains(out, format) {
			t.Errorf("Output format %q not documented in help", format)
		}
	}
}
