package main

import "testing"

func TestBrandNameUsesClineForClineBinary(t *testing.T) {
	t.Helper()
	tests := []struct {
		name     string
		execBase string
		want     string
	}{
		{"cline_linux", "/usr/local/bin/cline", "Cline"},
		{"cline_windows", "C:\\Program Files\\cline.exe", "Cline"},
		{"caret", "/usr/local/bin/caret", "Caret"},
		{"unknown", "/tmp/something", "Caret"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := brandNameForTest(tt.execBase)
			if got != tt.want {
				t.Fatalf("brandNameForTest(%q)=%q, want %q", tt.execBase, got, tt.want)
			}
		})
	}
}
