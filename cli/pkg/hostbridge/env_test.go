package hostbridge

import (
	"context"
	"testing"
	"time"

	"github.com/cline/grpc-go/cline"
)

func resetShutdownDiagnostics() {
	shutdownRequestCount.Store(0)
	lastShutdownRequest.Store(time.Time{})
}

func TestShutdownRecordsDiagnostics(t *testing.T) {
	resetShutdownDiagnostics()

	service := NewEnvService(false)
	if _, err := service.Shutdown(context.Background(), &cline.EmptyRequest{}); err != nil {
		t.Fatalf("shutdown returned error: %v", err)
	}

	count, last := GetShutdownDiagnostics()
	if count != 1 {
		t.Fatalf("expected shutdown count 1, got %d", count)
	}
	if last.IsZero() {
		t.Fatalf("expected last shutdown timestamp to be set")
	}
}
