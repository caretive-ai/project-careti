// CARETI MODIFICATION: E2E tests for agent and chatbot modes
package e2e

import (
	"context"
	"os/exec"
	"strings"
	"testing"
)

// TestAgentModeHelp verifies that --mode flag shows agent and chatbot options
func TestAgentModeHelp(t *testing.T) {
	// Don't set CLINE_DIR for help test - it doesn't need config
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	// Run help command directly without --config flag
	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB, errB := &strings.Builder{}, &strings.Builder{}
	cmd.Stdout = outB
	cmd.Stderr = errB
	err := cmd.Run()

	out := outB.String()
	errOut := errB.String()

	if err != nil {
		t.Fatalf("help command failed: %v\nstdout: %s\nstderr: %s", err, out, errOut)
	}

	// Verify mode flag includes agent and chatbot
	if !strings.Contains(out, "agent") {
		t.Errorf("help output should mention 'agent' mode, got:\n%s", out)
	}
	if !strings.Contains(out, "chatbot") {
		t.Errorf("help output should mention 'chatbot' mode, got:\n%s", out)
	}
	if !strings.Contains(out, "act|plan|agent|chatbot") {
		t.Errorf("help output should show all modes (act|plan|agent|chatbot), got:\n%s", out)
	}
}

// TestModeAndPersonaFlagsInHelp verifies that mode and persona flags appear in root help
func TestModeAndPersonaFlagsInHelp(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()

	// Verify --mode flag shows all modes
	if !strings.Contains(out, "-m, --mode") {
		t.Errorf("help should show -m, --mode flag:\n%s", out)
	}
	if !strings.Contains(out, "act|plan|agent|chatbot") {
		t.Errorf("help should show all modes (act|plan|agent|chatbot):\n%s", out)
	}

	// Verify --persona flag exists
	if !strings.Contains(out, "-p, --persona") {
		t.Errorf("help should show -p, --persona flag:\n%s", out)
	}
	if !strings.Contains(out, "persona name for agent mode") {
		t.Errorf("help should describe persona flag for agent mode:\n%s", out)
	}
}

// TestModeDefaultValue verifies the default mode is agent
func TestModeDefaultValue(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB := &strings.Builder{}
	cmd.Stdout = outB
	_ = cmd.Run()

	out := outB.String()

	// Verify default mode is agent
	if !strings.Contains(out, `(default "agent")`) {
		t.Errorf("default mode should be agent:\n%s", out)
	}
}

// TestVersionCommand verifies the version command works
func TestVersionCommand(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "version")
	outB, errB := &strings.Builder{}, &strings.Builder{}
	cmd.Stdout = outB
	cmd.Stderr = errB
	err := cmd.Run()

	out := outB.String()
	errOut := errB.String()

	if err != nil {
		t.Fatalf("version command failed: %v\nstdout: %s\nstderr: %s", err, out, errOut)
	}

	// Verify version output contains expected fields
	if !strings.Contains(out, "CLI Version") {
		t.Errorf("version output should contain 'CLI Version':\n%s", out)
	}
	if !strings.Contains(out, "Core Version") {
		t.Errorf("version output should contain 'Core Version':\n%s", out)
	}
}

// TestNoDebugLogsByDefault verifies debug logs are not shown without --verbose
func TestNoDebugLogsByDefault(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	bin := repoAwareBinPath(t)
	cmd := exec.CommandContext(ctx, bin, "--help")
	outB, errB := &strings.Builder{}, &strings.Builder{}
	cmd.Stdout = outB
	cmd.Stderr = errB
	_ = cmd.Run()

	out := outB.String()
	errOut := errB.String()
	combined := out + errOut

	// Verify no debug logs in output
	if strings.Contains(combined, "[CLI-DEBUG]") {
		t.Errorf("debug logs should not appear without --verbose:\n%s", combined)
	}
}
