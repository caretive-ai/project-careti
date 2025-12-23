package task

import (
	"sync"
	"time"

	"github.com/cline/cli/pkg/cli/types"
)

const partialStallTimeout = 10 * time.Second

type partialStallTracker struct {
	mu             sync.Mutex
	timeout        time.Duration
	lastTimestamp  int64
	lastTextLen    int
	lastReasonLen  int
	lastProgressAt time.Time
}

func newPartialStallTracker(timeout time.Duration) *partialStallTracker {
	return &partialStallTracker{timeout: timeout}
}

func (t *partialStallTracker) Reset() {
	t.mu.Lock()
	defer t.mu.Unlock()

	t.lastTimestamp = 0
	t.lastTextLen = 0
	t.lastReasonLen = 0
	t.lastProgressAt = time.Time{}
}

func (t *partialStallTracker) AllowIfStalled(msg *types.ClineMessage, now time.Time) bool {
	if msg == nil {
		t.Reset()
		return false
	}

	t.mu.Lock()
	defer t.mu.Unlock()

	if t.timeout <= 0 {
		return false
	}

	textLen := len(msg.Text)
	reasonLen := len(msg.Reasoning)
	if t.lastProgressAt.IsZero() ||
		msg.Timestamp != t.lastTimestamp ||
		textLen != t.lastTextLen ||
		reasonLen != t.lastReasonLen {
		t.lastTimestamp = msg.Timestamp
		t.lastTextLen = textLen
		t.lastReasonLen = reasonLen
		t.lastProgressAt = now
		return false
	}

	return now.Sub(t.lastProgressAt) >= t.timeout
}
