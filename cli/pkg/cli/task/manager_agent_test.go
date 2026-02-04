// CARETI MODIFICATION: Unit tests for agent/chatbot mode functionality
package task

import (
	"context"
	"testing"
)

// TestSetCaretAgentModeNilClient verifies error handling when client is nil
func TestSetCaretAgentModeNilClient(t *testing.T) {
	manager := &Manager{}

	err := manager.SetCaretAgentMode(context.Background())
	if err == nil {
		t.Error("expected error when client is nil")
	}
	if err.Error() != "client not initialized" {
		t.Errorf("expected 'client not initialized' error, got: %v", err)
	}
}

// TestSetCaretChatbotModeNilClient verifies error handling when client is nil
func TestSetCaretChatbotModeNilClient(t *testing.T) {
	manager := &Manager{}

	err := manager.SetCaretChatbotMode(context.Background())
	if err == nil {
		t.Error("expected error when client is nil")
	}
	if err.Error() != "client not initialized" {
		t.Errorf("expected 'client not initialized' error, got: %v", err)
	}
}

// TestSetPersonaNilClient verifies error handling when client is nil
func TestSetPersonaNilClient(t *testing.T) {
	manager := &Manager{}

	err := manager.SetPersona(context.Background(), "test-persona")
	if err == nil {
		t.Error("expected error when persona client is nil")
	}
	if err.Error() != "persona client not initialized" {
		t.Errorf("expected 'persona client not initialized' error, got: %v", err)
	}
}

// TestSetModeInvalidMode verifies error handling for invalid modes
func TestSetModeInvalidMode(t *testing.T) {
	manager := &Manager{}

	// SetMode only accepts act/plan, not agent/chatbot (those are handled separately)
	err := manager.SetMode(context.Background(), "invalid", nil, nil, nil)
	if err == nil {
		t.Error("expected error for invalid mode")
	}
	if err.Error() != "invalid mode 'invalid': must be 'act' or 'plan'" {
		t.Errorf("unexpected error message: %v", err)
	}

	// agent mode should also fail in SetMode (it's handled at higher level)
	err = manager.SetMode(context.Background(), "agent", nil, nil, nil)
	if err == nil {
		t.Error("expected error for agent mode in SetMode")
	}

	// chatbot mode should also fail in SetMode
	err = manager.SetMode(context.Background(), "chatbot", nil, nil, nil)
	if err == nil {
		t.Error("expected error for chatbot mode in SetMode")
	}
}
