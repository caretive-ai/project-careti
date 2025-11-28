package auth

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/cline/cli/pkg/cli/task"
	"github.com/cline/grpc-go/caret"
)

type mockLiteLlmClient struct {
	req  *caret.FetchLiteLlmModelsRequest
	resp *caret.FetchLiteLlmModelsResponse
	err  error
}

func (m *mockLiteLlmClient) FetchLiteLlmModels(ctx context.Context, in *caret.FetchLiteLlmModelsRequest) (*caret.FetchLiteLlmModelsResponse, error) {
	m.req = in
	return m.resp, m.err
}

func TestFetchLiteLlmModelsSuccess(t *testing.T) {
	ctx := context.Background()
	mockClient := &mockLiteLlmClient{
		resp: &caret.FetchLiteLlmModelsResponse{
			Success: true,
			Models:  []string{"m1", "m2"},
		},
	}
	originalFactory := liteLlmClientFactory
	liteLlmClientFactory = func(_ *task.Manager) liteLlmClient { return mockClient }
	defer func() {
		liteLlmClientFactory = originalFactory
	}()

	models, err := FetchLiteLlmModels(ctx, nil, "https://litellm.local", "secret")
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}

	if mockClient.req == nil {
		t.Fatalf("request not captured")
	}
	if mockClient.req.GetBaseUrl() != "https://litellm.local" {
		t.Fatalf("base URL not forwarded, got %s", mockClient.req.GetBaseUrl())
	}
	if mockClient.req.GetApiKey() != "secret" {
		t.Fatalf("api key not forwarded, got %s", mockClient.req.GetApiKey())
	}
	if got := len(models); got != 2 || models[0] != "m1" || models[1] != "m2" {
		t.Fatalf("models mismatch, got %v", models)
	}
}

func TestFetchLiteLlmModelsErrorResponse(t *testing.T) {
	ctx := context.Background()
	mockClient := &mockLiteLlmClient{
		resp: &caret.FetchLiteLlmModelsResponse{
			Success:      false,
			ErrorMessage: "invalid credentials",
		},
	}
	originalFactory := liteLlmClientFactory
	liteLlmClientFactory = func(_ *task.Manager) liteLlmClient { return mockClient }
	defer func() {
		liteLlmClientFactory = originalFactory
	}()

	_, err := FetchLiteLlmModels(ctx, nil, "https://litellm.local", "bad")
	if err == nil {
		t.Fatalf("expected error for unsuccessful response")
	}
	if !strings.Contains(err.Error(), "invalid credentials") {
		t.Fatalf("error does not include server message: %v", err)
	}
}

func TestFetchLiteLlmModelsRpcFailure(t *testing.T) {
	ctx := context.Background()
	mockClient := &mockLiteLlmClient{
		err: errors.New("rpc failed"),
	}
	originalFactory := liteLlmClientFactory
	liteLlmClientFactory = func(_ *task.Manager) liteLlmClient { return mockClient }
	defer func() {
		liteLlmClientFactory = originalFactory
	}()

	_, err := FetchLiteLlmModels(ctx, nil, "https://litellm.local", "secret")
	if err == nil {
		t.Fatalf("expected error when RPC fails")
	}
	if !strings.Contains(err.Error(), "rpc failed") {
		t.Fatalf("unexpected error: %v", err)
	}
}
