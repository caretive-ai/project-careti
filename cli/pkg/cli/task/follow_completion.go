package task

import (
	"encoding/json"

	"github.com/cline/cli/pkg/cli/types"
)

func evaluateFollowCompletion(messages []*types.ClineMessage) (bool, bool) {
	foundCompletion := false
	foundUsage := false

	for _, msg := range messages {
		if msg == nil {
			continue
		}
		if msg.Say == string(types.SayTypeCompletionResult) || msg.Ask == string(types.AskTypeCompletionResult) {
			foundCompletion = true
		}
		if msg.Say == string(types.SayTypeAPIReqStarted) {
			apiInfo := types.APIRequestInfo{Cost: -1}
			if err := json.Unmarshal([]byte(msg.Text), &apiInfo); err == nil && apiInfo.Cost >= 0 {
				foundUsage = true
			}
		}
	}

	return foundCompletion, foundUsage
}
