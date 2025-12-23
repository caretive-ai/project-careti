package task

import (
	"testing"
	"time"

	"github.com/cline/cli/pkg/cli/types"
)

func TestPartialStallTrackerAllowIfStalled(t *testing.T) {
	tracker := newPartialStallTracker(2 * time.Second)
	base := time.Now()
	msg := &types.ClineMessage{Timestamp: 1, Text: "hello"}

	if tracker.AllowIfStalled(msg, base) {
		t.Fatalf("expected not stalled on first observation")
	}
	if tracker.AllowIfStalled(msg, base.Add(1500*time.Millisecond)) {
		t.Fatalf("expected not stalled before timeout")
	}
	if !tracker.AllowIfStalled(msg, base.Add(3*time.Second)) {
		t.Fatalf("expected stalled after timeout")
	}

	msg.Text = "hello!"
	if tracker.AllowIfStalled(msg, base.Add(3500*time.Millisecond)) {
		t.Fatalf("expected progress to reset stall timer")
	}
}
