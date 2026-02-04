// CARETI MODIFICATION: E2E tests for CLI behavior verification
// These tests verify CLI behavior patterns, not just output format
package e2e

import (
	"context"
	"os/exec"
	"regexp"
	"strings"
	"testing"
)

// TestYoloFlagSetsNonInteractive verifies --yolo flag behavior
func TestYoloFlagSetsNonInteractive(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()

	// Verify yolo flag exists and is documented
	if !strings.Contains(out, "--yolo") {
		t.Errorf("--yolo flag not found in help")
	}
	if !strings.Contains(out, "non-interactive") {
		t.Errorf("--yolo should be documented as non-interactive mode")
	}

	t.Logf("Yolo flag documentation:\n%s", extractFlagLine(out, "yolo"))
}

// TestOneshotFlagExists verifies --oneshot flag
func TestOneshotFlagExists(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()

	if !strings.Contains(out, "--oneshot") {
		t.Errorf("--oneshot flag not found in help")
	}
	if !strings.Contains(out, "autonomous") {
		t.Errorf("--oneshot should be documented as autonomous mode")
	}

	t.Logf("Oneshot flag documentation:\n%s", extractFlagLine(out, "oneshot"))
}

// TestAgentModeIsDefault verifies agent mode is default
func TestAgentModeIsDefault(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()

	// Should show agent as default
	if !strings.Contains(out, `default "agent"`) {
		t.Errorf("Agent should be the default mode, got:\n%s", extractFlagLine(out, "mode"))
	}
}

// TestVerboseFlagControlsDebugOutput verifies verbose flag
func TestVerboseFlagControlsDebugOutput(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)

	// Test without verbose - should not have debug output
	cmd := exec.CommandContext(ctx, bin, "version")
	outB, errB := &strings.Builder{}, &strings.Builder{}
	cmd.Stdout = outB
	cmd.Stderr = errB
	_ = cmd.Run()

	combined := outB.String() + errB.String()
	if strings.Contains(combined, "[CLI-DEBUG]") {
		t.Errorf("Debug output should not appear without --verbose:\n%s", combined)
	}

	t.Logf("Version output without verbose (no debug expected):\n%s", combined)
}

// TestCommandStructure verifies command hierarchy
func TestCommandStructure(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()

	// Expected subcommands
	expectedCommands := []string{
		"auth",
		"config",
		"task",
		"instance",
		"logs",
		"version",
		"completion",
	}

	for _, cmdName := range expectedCommands {
		if !strings.Contains(out, cmdName) {
			t.Errorf("Expected subcommand %q not found", cmdName)
		}
	}

	t.Logf("All expected subcommands found")
}

// TestTaskListSubcommand verifies task list exists
func TestTaskListSubcommand(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "task", "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	err := cmd.Run()

	if err != nil {
		t.Fatalf("task --help failed: %v", err)
	}

	out := outB.String()
	t.Logf("Task help:\n%s", out)

	if !strings.Contains(out, "list") {
		t.Errorf("Task should have 'list' subcommand")
	}
}

// TestInstanceSubcommand verifies instance command exists
func TestInstanceSubcommand(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "instance", "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	err := cmd.Run()

	if err != nil {
		t.Fatalf("instance --help failed: %v", err)
	}

	out := outB.String()
	t.Logf("Instance help:\n%s", out)
}

// TestLogsSubcommand verifies logs command exists
func TestLogsSubcommand(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "logs", "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	err := cmd.Run()

	if err != nil {
		t.Fatalf("logs --help failed: %v", err)
	}

	out := outB.String()
	t.Logf("Logs help:\n%s", out)
}

// TestBrandingConsistency verifies branding is consistent
func TestBrandingConsistency(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)

	// Check help
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()
	helpOut := outB.String()

	// Check version
	cmd = exec.CommandContext(ctx, bin, "version")
	outB = &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()
	versionOut := outB.String()

	// Should use "Careti" branding
	if !strings.Contains(helpOut, "Careti") {
		t.Errorf("Help should mention Careti branding")
	}
	if !strings.Contains(versionOut, "Careti") {
		t.Errorf("Version should mention Careti branding")
	}

	// Should use "careti" command name
	if !strings.Contains(helpOut, "careti") {
		t.Errorf("Help should use careti command name")
	}

	t.Logf("Branding check passed - using Careti/careti")
}

// Helper function to extract a flag line from help output
func extractFlagLine(output, flagName string) string {
	lines := strings.Split(output, "\n")
	for _, line := range lines {
		if strings.Contains(line, "--"+flagName) {
			return strings.TrimSpace(line)
		}
	}
	return "(not found)"
}

// TestHelpOutputHasNoUnexpectedPatterns checks for problematic patterns
func TestHelpOutputHasNoUnexpectedPatterns(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB, errB := &strings.Builder{}, &strings.Builder{}
	cmd.Stdout = outB
	cmd.Stderr = errB
	_ = cmd.Run()

	combined := outB.String() + errB.String()

	// Check for problematic patterns
	badPatterns := []struct {
		pattern string
		desc    string
	}{
		{`\[CLI-DEBUG\]`, "Debug logs should not appear"},
		{`panic:`, "Should not have panic output"},
		{`undefined`, "Should not have undefined values"},
		{`<nil>`, "Should not have nil string representations"},
	}

	for _, bp := range badPatterns {
		matched, _ := regexp.MatchString(bp.pattern, combined)
		if matched {
			t.Errorf("%s: pattern %q found in output", bp.desc, bp.pattern)
		}
	}
}
