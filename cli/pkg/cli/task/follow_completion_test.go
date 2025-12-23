package task

import (
	"testing"

	"github.com/cline/cli/pkg/cli/types"
)

func TestEvaluateFollowCompletion(t *testing.T) {
	messages := []*types.ClineMessage{
		{Say: string(types.SayTypeAPIReqStarted), Text: `{"cost":0.01}`},
		{Say: string(types.SayTypeCompletionResult)},
	}

	foundCompletion, foundUsage := evaluateFollowCompletion(messages)
	if !foundCompletion {
		t.Fatalf("expected completion to be found")
	}
	if !foundUsage {
		t.Fatalf("expected usage to be found")
	}
}
