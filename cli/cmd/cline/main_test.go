package main

import (
	"testing"

	"github.com/cline/cli/pkg/common"
)

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
			got := common.ResolveBrandNameForPath(tt.execBase)
			if got != tt.want {
				t.Fatalf("ResolveBrandNameForPath(%q)=%q, want %q", tt.execBase, got, tt.want)
			}
		})
	}
}
