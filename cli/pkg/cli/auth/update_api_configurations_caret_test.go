package auth

import (
	"context"
	"testing"

	"github.com/cline/cli/pkg/cli/task"
	"github.com/cline/grpc-go/cline"
	"google.golang.org/protobuf/proto"
)

func TestUpdateProviderPartialCaretSetsModelInfoAndBaseURL(t *testing.T) {
	oldFn := updateApiConfigurationPartialFn
	t.Cleanup(func() {
		updateApiConfigurationPartialFn = oldFn
	})

	var got *cline.UpdateApiConfigurationPartialRequest
	updateApiConfigurationPartialFn = func(_ context.Context, _ *task.Manager, request *cline.UpdateApiConfigurationPartialRequest) error {
		got = request
		return nil
	}

	modelID := "gemini/gemini-2.5-flash"
	baseURL := "https://api.caret.team"
	modelInfo := &cline.CaretModelInfo{
		MaxTokens:           proto.Int64(123),
		ContextWindow:       proto.Int64(456),
		SupportsImages:      proto.Bool(true),
		SupportsPromptCache: true,
		InputPrice:          proto.Float64(0.1),
		OutputPrice:         proto.Float64(0.2),
		CacheWritesPrice:    proto.Float64(0.3),
		CacheReadsPrice:     proto.Float64(0.4),
		Description:         proto.String("desc"),
	}

	updates := ProviderUpdatesPartial{
		ModelID:   proto.String(modelID),
		ModelInfo: modelInfo,
		BaseURL:   proto.String(baseURL),
	}

	if err := UpdateProviderPartial(context.Background(), nil, cline.ApiProvider_CARET, updates, true); err != nil {
		t.Fatalf("UpdateProviderPartial returned error: %v", err)
	}
	if got == nil || got.ApiConfiguration == nil || got.UpdateMask == nil {
		t.Fatalf("expected request with api configuration and update mask, got %#v", got)
	}

	if got.ApiConfiguration.GetPlanModeApiProvider() != cline.ApiProvider_CARET {
		t.Fatalf("plan provider = %v, want %v", got.ApiConfiguration.GetPlanModeApiProvider(), cline.ApiProvider_CARET)
	}
	if got.ApiConfiguration.GetActModeApiProvider() != cline.ApiProvider_CARET {
		t.Fatalf("act provider = %v, want %v", got.ApiConfiguration.GetActModeApiProvider(), cline.ApiProvider_CARET)
	}

	if got.ApiConfiguration.GetPlanModeCaretModelId() != modelID {
		t.Fatalf("plan model id = %q, want %q", got.ApiConfiguration.GetPlanModeCaretModelId(), modelID)
	}
	if got.ApiConfiguration.GetActModeCaretModelId() != modelID {
		t.Fatalf("act model id = %q, want %q", got.ApiConfiguration.GetActModeCaretModelId(), modelID)
	}

	if got.ApiConfiguration.CaretBaseUrl == nil || got.ApiConfiguration.GetCaretBaseUrl() != baseURL {
		t.Fatalf("caret base url = %q, want %q", got.ApiConfiguration.GetCaretBaseUrl(), baseURL)
	}

	if got.ApiConfiguration.PlanModeCaretModelInfo == nil {
		t.Fatalf("expected planModeCaretModelInfo to be set")
	}
	if got.ApiConfiguration.PlanModeCaretModelInfo.GetMaxTokens() != 123 {
		t.Fatalf("plan model info max tokens = %d, want %d", got.ApiConfiguration.PlanModeCaretModelInfo.GetMaxTokens(), 123)
	}

	if got.ApiConfiguration.ActModeCaretModelInfo == nil {
		t.Fatalf("expected actModeCaretModelInfo to be set")
	}
	if got.ApiConfiguration.ActModeCaretModelInfo.GetMaxTokens() != 123 {
		t.Fatalf("act model info max tokens = %d, want %d", got.ApiConfiguration.ActModeCaretModelInfo.GetMaxTokens(), 123)
	}

	expectedPaths := map[string]bool{
		"planModeApiProvider":    true,
		"actModeApiProvider":     true,
		"caretBaseUrl":           true,
		"planModeCaretModelId":   true,
		"actModeCaretModelId":    true,
		"planModeCaretModelInfo": true,
		"actModeCaretModelInfo":  true,
	}

	for _, path := range got.UpdateMask.Paths {
		delete(expectedPaths, path)
	}

	if len(expectedPaths) != 0 {
		t.Fatalf("missing expected field mask paths: %#v (actual: %#v)", expectedPaths, got.UpdateMask.Paths)
	}
}
