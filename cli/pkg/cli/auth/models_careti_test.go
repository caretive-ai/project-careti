package auth

import "testing"

func TestHasConfiguredCaretModelIDs(t *testing.T) {
	if hasConfiguredCaretModelIDs(nil) {
		t.Fatalf("expected false for nil api config")
	}

	if hasConfiguredCaretModelIDs(map[string]interface{}{}) {
		t.Fatalf("expected false for empty api config")
	}

	if !hasConfiguredCaretModelIDs(map[string]interface{}{"planModeCaretModelId": "gemini/gemini-2.5-flash"}) {
		t.Fatalf("expected true when planModeCaretModelId is set")
	}

	if !hasConfiguredCaretModelIDs(map[string]interface{}{"actModeCaretModelId": "gemini/gemini-2.5-flash"}) {
		t.Fatalf("expected true when actModeCaretModelId is set")
	}
}
