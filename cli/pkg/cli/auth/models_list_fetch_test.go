package auth

import (
	"context"
	"errors"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/cline/cli/pkg/cli/task"
	"github.com/cline/grpc-go/caret"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type mockLiteLlmClient struct {
	req  *careti.FetchLiteLlmModelsRequest
	resp *careti.FetchLiteLlmModelsResponse
	err  error
}

func (m *mockLiteLlmClient) FetchLiteLlmModels(ctx context.Context, in *careti.FetchLiteLlmModelsRequest) (*careti.FetchLiteLlmModelsResponse, error) {
	m.req = in
	return m.resp, m.err
}

func newIPv4TestServer(t *testing.T, handler http.Handler) *httptest.Server {
	t.Helper()
	listener, err := net.Listen("tcp4", "127.0.0.1:0")
	if err != nil {
		t.Skipf("skipping: cannot listen on IPv4 in this environment: %v", err)
	}
	server := httptest.NewUnstartedServer(handler)
	server.Listener = listener
	server.Start()
	return server
}

func TestFetchLiteLlmModelsSuccess(t *testing.T) {
	ctx := context.Background()
	mockClient := &mockLiteLlmClient{
		resp: &careti.FetchLiteLlmModelsResponse{
			Success: true,
			Models:  []string{"m1", "m2"},
		},
	}
	originalFactory := liteLlmClientFactory
	liteLlmClientFactory = func(_ *task.Manager) liteLlmClient { return mockClient }
	defer func() {
		liteLlmClientFactory = originalFactory
	}()

	models, err := FetchLiteLlmModels(ctx, nil, " https://litellm.local ", "secret")
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
		resp: &careti.FetchLiteLlmModelsResponse{
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

func TestFetchLiteLlmModelsMissingBaseURL(t *testing.T) {
	ctx := context.Background()
	_, err := FetchLiteLlmModels(ctx, nil, "   ", "secret")
	if err == nil {
		t.Fatalf("expected error for missing base URL")
	}
	if !strings.Contains(err.Error(), "base URL") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestFetchLiteLlmModelsClientUnavailable(t *testing.T) {
	ctx := context.Background()
	var healthAuth string
	var apiKeyHeader string
	var healthCalled bool
	srv := newIPv4TestServer(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/health":
			healthCalled = true
			healthAuth = r.Header.Get("Authorization")
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"healthy_endpoints":[{"model":"x"}]}`))
		case "/v1/models":
			apiKeyHeader = r.Header.Get("x-litellm-api-key")
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"models":[{"id":"x"},{"id":"y"}]}`))
		default:
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
	}))
	defer srv.Close()

	originalFactory := liteLlmClientFactory
	liteLlmClientFactory = func(_ *task.Manager) liteLlmClient { return nil }
	defer func() {
		liteLlmClientFactory = originalFactory
	}()

	models, err := FetchLiteLlmModels(ctx, nil, srv.URL, "secret")
	if err != nil {
		t.Fatalf("expected HTTP fallback success, got error: %v", err)
	}
	if !healthCalled {
		t.Fatalf("expected health endpoint to be called")
	}
	if healthAuth != "Bearer secret" {
		t.Fatalf("expected Authorization header, got %s", healthAuth)
	}
	if apiKeyHeader != "secret" {
		t.Fatalf("expected x-litellm-api-key header, got %s", apiKeyHeader)
	}
	if len(models) == 0 || models[0] != "x" {
		t.Fatalf("unexpected models: %v", models)
	}
}

func TestFetchLiteLlmModelsHttpFallbackOnUnimplemented(t *testing.T) {
	ctx := context.Background()

	var healthAuth string
	var apiKeyHeader string
	var healthCalled bool
	srv := newIPv4TestServer(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/health":
			healthCalled = true
			healthAuth = r.Header.Get("Authorization")
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"healthy_endpoints":[{"model":"m1"}]}`))
		case "/v1/models":
			apiKeyHeader = r.Header.Get("x-litellm-api-key")
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"data":[{"id":"m1"},{"id":"m2"}]}`))
		default:
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
	}))
	defer srv.Close()

	mockClient := &mockLiteLlmClient{
		err: status.Error(codes.Unimplemented, "not implemented"),
	}
	originalFactory := liteLlmClientFactory
	liteLlmClientFactory = func(_ *task.Manager) liteLlmClient { return mockClient }
	defer func() {
		liteLlmClientFactory = originalFactory
	}()

	models, err := FetchLiteLlmModels(ctx, nil, " "+srv.URL+" ", "secret")
	if err != nil {
		t.Fatalf("expected HTTP fallback success, got error: %v", err)
	}
	if healthAuth != "Bearer secret" {
		t.Fatalf("expected Authorization header, got %s", healthAuth)
	}
	if apiKeyHeader != "secret" {
		t.Fatalf("expected x-litellm-api-key header, got %s", apiKeyHeader)
	}
	if !healthCalled {
		t.Fatalf("expected health endpoint to be called")
	}
	if len(models) == 0 || models[0] != "m1" {
		t.Fatalf("unexpected models: %v", models)
	}
}
