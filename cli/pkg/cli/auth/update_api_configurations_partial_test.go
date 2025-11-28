package auth

import (
	"context"
	"testing"

	"github.com/cline/cli/pkg/cli/task"
	"github.com/cline/grpc-go/cline"
	"google.golang.org/protobuf/proto"
)

type capturedUpdate struct {
	request *cline.UpdateApiConfigurationPartialRequest
}

func withPatchedUpdateFn(t *testing.T, fn func(context.Context, *task.Manager, *cline.UpdateApiConfigurationPartialRequest) error, run func(*capturedUpdate)) {
	t.Helper()
	original := updateApiConfigurationPartialFn
	record := &capturedUpdate{}
	updateApiConfigurationPartialFn = func(ctx context.Context, manager *task.Manager, request *cline.UpdateApiConfigurationPartialRequest) error {
		record.request = request
		return fn(ctx, manager, request)
	}
	defer func() {
		updateApiConfigurationPartialFn = original
	}()

	run(record)
}

func TestUpdateProviderPartialBizRouterUsesProviderSpecificFields(t *testing.T) {
	ctx := context.Background()
	modelID := proto.String("bizrouter/model")
	apiKey := proto.String("biz-key")

	withPatchedUpdateFn(t, func(_ context.Context, _ *task.Manager, _ *cline.UpdateApiConfigurationPartialRequest) error {
		return nil
	}, func(c *capturedUpdate) {
		if err := UpdateProviderPartial(ctx, nil, cline.ApiProvider_BIZROUTER, ProviderUpdatesPartial{
			ModelID: modelID,
			APIKey:  apiKey,
		}, true); err != nil {
			t.Fatalf("UpdateProviderPartial returned error: %v", err)
		}

		if c.request == nil {
			t.Fatalf("request was not captured")
		}

		cfg := c.request.ApiConfiguration
		if cfg.GetPlanModeBizRouterModelId() != *modelID {
			t.Fatalf("plan BizRouter model ID not set, got %s", cfg.GetPlanModeBizRouterModelId())
		}
		if cfg.GetActModeBizRouterModelId() != *modelID {
			t.Fatalf("act BizRouter model ID not set, got %s", cfg.GetActModeBizRouterModelId())
		}
		if cfg.GetBizRouterApiKey() != *apiKey {
			t.Fatalf("BizRouter API key not set, got %s", cfg.GetBizRouterApiKey())
		}

		if cfg.GetPlanModeApiProvider() != cline.ApiProvider_BIZROUTER {
			t.Fatalf("plan provider not set to BizRouter, got %v", cfg.GetPlanModeApiProvider())
		}
		if cfg.GetActModeApiProvider() != cline.ApiProvider_BIZROUTER {
			t.Fatalf("act provider not set to BizRouter, got %v", cfg.GetActModeApiProvider())
		}

		if !containsAll(c.request.UpdateMask.GetPaths(), []string{
			"bizRouterApiKey",
			"planModeBizRouterModelId",
			"actModeBizRouterModelId",
			"planModeApiProvider",
			"actModeApiProvider",
		}) {
			t.Fatalf("field mask missing BizRouter fields: %v", c.request.UpdateMask.GetPaths())
		}
	})
}

func TestAddProviderPartialLiteLlmIncludesBaseURLAndSpecificFields(t *testing.T) {
	ctx := context.Background()
	withPatchedUpdateFn(t, func(_ context.Context, _ *task.Manager, _ *cline.UpdateApiConfigurationPartialRequest) error {
		return nil
	}, func(c *capturedUpdate) {
		err := AddProviderPartial(ctx, nil, cline.ApiProvider_LITELLM, "model-1", "lite-key", "https://litellm.local", nil)
		if err != nil {
			t.Fatalf("AddProviderPartial returned error: %v", err)
		}

		if c.request == nil {
			t.Fatalf("request was not captured")
		}

		cfg := c.request.ApiConfiguration
		if cfg.GetLiteLlmApiKey() != "lite-key" {
			t.Fatalf("LiteLLM API key not set, got %s", cfg.GetLiteLlmApiKey())
		}
		if cfg.GetLiteLlmBaseUrl() != "https://litellm.local" {
			t.Fatalf("LiteLLM base URL not set, got %s", cfg.GetLiteLlmBaseUrl())
		}
		if cfg.GetPlanModeLiteLlmModelId() != "model-1" || cfg.GetActModeLiteLlmModelId() != "model-1" {
			t.Fatalf("LiteLLM model IDs not set correctly: plan=%s act=%s", cfg.GetPlanModeLiteLlmModelId(), cfg.GetActModeLiteLlmModelId())
		}

		if !containsAll(c.request.UpdateMask.GetPaths(), []string{
			"liteLlmApiKey",
			"liteLlmBaseUrl",
			"planModeLiteLlmModelId",
			"actModeLiteLlmModelId",
		}) {
			t.Fatalf("field mask missing LiteLLM fields: %v", c.request.UpdateMask.GetPaths())
		}
	})
}

func containsAll(haystack []string, needles []string) bool {
	if len(needles) == 0 {
		return true
	}

	for _, needle := range needles {
		found := false
		for _, item := range haystack {
			if item == needle {
				found = true
				break
			}
		}
		if !found {
			return false
		}
	}
	return true
}
