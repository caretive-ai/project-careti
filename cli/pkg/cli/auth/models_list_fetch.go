package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/charmbracelet/huh"
	"github.com/cline/cli/pkg/cli/task"
	careti "github.com/cline/grpc-go/caret"
	"github.com/cline/grpc-go/cline"
	"golang.org/x/term"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type liteLlmClient interface {
	FetchLiteLlmModels(ctx context.Context, in *careti.FetchLiteLlmModelsRequest) (*careti.FetchLiteLlmModelsResponse, error)
}

var liteLlmClientFactory = func(manager *task.Manager) liteLlmClient {
	if manager == nil {
		return nil
	}
	return manager.GetClient().Caretsystem
}

const liteLlmRequestTimeout = 15 * time.Second

// FetchOpenRouterModels fetches available OpenRouter models from Cline Core
func FetchOpenRouterModels(ctx context.Context, manager *task.Manager) (map[string]*cline.OpenRouterModelInfo, error) {
	resp, err := manager.GetClient().Models.RefreshOpenRouterModelsRpc(ctx, &cline.EmptyRequest{})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch OpenRouter models: %w", err)
	}
	return resp.Models, nil
}

// FetchOcaModels fetches available Oca models from Cline Core
func FetchOcaModels(ctx context.Context, manager *task.Manager) (map[string]*cline.OcaModelInfo, error) {
	resp, err := manager.GetClient().Models.RefreshOcaModels(ctx, &cline.StringRequest{})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Oca models: %w", err)
	}
	return resp.Models, nil
}

// ConvertOpenRouterModelsToInterface converts OpenRouter model map to generic interface map.
// This allows OpenRouter and Cline models to be used with the generic fetching utilities.
func ConvertOpenRouterModelsToInterface(models map[string]*cline.OpenRouterModelInfo) map[string]interface{} {
	result := make(map[string]interface{}, len(models))
	for k, v := range models {
		result[k] = v
	}
	return result
}

// FetchOpenAiModels fetches available OpenAI models from Cline Core
// Takes the API key and returns a list of model IDs
func FetchOpenAiModels(ctx context.Context, manager *task.Manager, baseURL, apiKey string) ([]string, error) {
	req := &cline.OpenAiModelsRequest{
		BaseUrl: baseURL,
		ApiKey:  apiKey,
	}

	resp, err := manager.GetClient().Models.RefreshOpenAiModels(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch OpenAI models: %w", err)
	}
	return resp.Values, nil
}

// FetchOllamaModels fetches available Ollama models from Cline Core
// Takes the base URL (empty string for default) and returns a list of model IDs
func FetchOllamaModels(ctx context.Context, manager *task.Manager, baseURL string) ([]string, error) {
	req := &cline.StringRequest{
		Value: baseURL,
	}

	resp, err := manager.GetClient().Models.GetOllamaModels(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Ollama models: %w", err)
	}
	return resp.Values, nil
}

// FetchLiteLlmModels fetches available LiteLLM models via Caret System gRPC service
func FetchLiteLlmModels(ctx context.Context, manager *task.Manager, baseURL, apiKey string) ([]string, error) {
	trimmedBaseURL := strings.TrimSpace(baseURL)
	if trimmedBaseURL == "" {
		return nil, fmt.Errorf("LiteLLM base URL is required to fetch models")
	}

	ctxWithTimeout := ctx
	if _, hasDeadline := ctx.Deadline(); !hasDeadline {
		var cancel context.CancelFunc
		ctxWithTimeout, cancel = context.WithTimeout(ctx, liteLlmRequestTimeout)
		defer cancel()
	}

	client := liteLlmClientFactory(manager)
	if client == nil {
		// CARETI MODIFICATION: fall back to direct HTTP when client is unavailable
		return fetchLiteLlmModelsHTTP(ctxWithTimeout, trimmedBaseURL, strings.TrimSpace(apiKey))
	}

	req := &careti.FetchLiteLlmModelsRequest{
		BaseUrl: trimmedBaseURL,
		ApiKey:  strings.TrimSpace(apiKey),
	}

	resp, err := client.FetchLiteLlmModels(ctxWithTimeout, req)
	if err != nil {
		// CARETI MODIFICATION: fallback to HTTP when server doesn't implement the RPC
		if status.Code(err) == codes.Unimplemented {
			return fetchLiteLlmModelsHTTP(ctxWithTimeout, trimmedBaseURL, strings.TrimSpace(apiKey))
		}
		if strings.Contains(strings.ToLower(err.Error()), "unimplemented") {
			return fetchLiteLlmModelsHTTP(ctxWithTimeout, trimmedBaseURL, strings.TrimSpace(apiKey))
		}
		return nil, fmt.Errorf("failed to fetch LiteLLM models: %w", err)
	}

	if !resp.GetSuccess() {
		if resp.GetErrorMessage() != "" {
			return nil, fmt.Errorf("LiteLLM error: %s", resp.GetErrorMessage())
		}
		return nil, fmt.Errorf("LiteLLM model fetching failed with unknown error")
	}

	return resp.GetModels(), nil
}

// CARETI MODIFICATION: direct HTTP fallback for LiteLLM /v1/models
func fetchLiteLlmModelsHTTP(ctx context.Context, baseURL, apiKey string) ([]string, error) {
	parsed, err := url.Parse(baseURL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return nil, fmt.Errorf("invalid LiteLLM base URL: %s", baseURL)
	}

	normalizeModelName := func(name string) string {
		normalized := name
		if strings.HasPrefix(normalized, "ollama_chat/") {
			normalized = strings.TrimPrefix(normalized, "ollama_chat/")
		}
		normalized = strings.ReplaceAll(normalized, ":", "-")
		return normalized
	}

	client := &http.Client{Timeout: liteLlmRequestTimeout}
	base := strings.TrimRight(baseURL, "/")

	// Step 1: health check (Bearer)
	healthURL := base + "/health"
	healthReq, err := http.NewRequestWithContext(ctx, http.MethodGet, healthURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build LiteLLM health request: %w", err)
	}
	healthReq.Header.Set("accept", "application/json")
	if apiKey != "" {
		healthReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	}

	healthyModels := []string{}
	healthAvailable := false
	if resp, err := client.Do(healthReq); err == nil {
		defer resp.Body.Close()
		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			var body struct {
				HealthyEndpoints []struct {
					Model string `json:"model"`
				} `json:"healthy_endpoints"`
			}
			if decodeErr := json.NewDecoder(resp.Body).Decode(&body); decodeErr == nil {
				for _, entry := range body.HealthyEndpoints {
					if entry.Model != "" {
						healthyModels = append(healthyModels, entry.Model)
					}
				}
				healthAvailable = true
			}
		}
	}

	// Step 2: models list (x-litellm-api-key)
	modelsURL := base + "/v1/models?return_wildcard_routes=false&include_model_access_groups=false&only_model_access_groups=false&include_metadata=false"
	modelsReq, err := http.NewRequestWithContext(ctx, http.MethodGet, modelsURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build LiteLLM models request: %w", err)
	}
	modelsReq.Header.Set("accept", "application/json")
	if apiKey != "" {
		modelsReq.Header.Set("x-litellm-api-key", apiKey)
	}

	modelsResp, err := client.Do(modelsReq)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch LiteLLM models (HTTP): %w", err)
	}
	defer modelsResp.Body.Close()

	if modelsResp.StatusCode < 200 || modelsResp.StatusCode >= 300 {
		return nil, fmt.Errorf("LiteLLM responded with status %d", modelsResp.StatusCode)
	}

	var parsedBody struct {
		Data   []struct {
			ID string `json:"id"`
		} `json:"data"`
		Models []struct {
			ID string `json:"id"`
		} `json:"models"`
	}

	if err := json.NewDecoder(modelsResp.Body).Decode(&parsedBody); err != nil {
		return nil, fmt.Errorf("failed to parse LiteLLM models response: %w", err)
	}

	var available []string
	for _, entry := range parsedBody.Data {
		if entry.ID != "" {
			available = append(available, normalizeModelName(entry.ID))
		}
	}
	for _, entry := range parsedBody.Models {
		if entry.ID != "" {
			available = append(available, normalizeModelName(entry.ID))
		}
	}

	if len(available) == 0 {
		return nil, fmt.Errorf("LiteLLM returned no models")
	}

	var finalModels []string
	if !healthAvailable {
		finalModels = available
	} else if len(healthyModels) == 0 {
		finalModels = []string{}
	} else {
		availableSet := make(map[string]struct{}, len(available))
		for _, m := range available {
			availableSet[m] = struct{}{}
		}
		for _, healthy := range healthyModels {
			normalized := normalizeModelName(healthy)
			if _, ok := availableSet[normalized]; ok {
				finalModels = append(finalModels, normalized)
			}
		}
	}

	// CARETI MODIFICATION: fallback if health returned models but intersection is empty (avoid empty list due to naming mismatches)
	if healthAvailable && len(finalModels) == 0 && len(healthyModels) > 0 && len(available) > 0 {
		finalModels = available
	}

	sort.Strings(finalModels)
	return finalModels, nil
}

// DisplayModelSelectionMenu shows an interactive menu for selecting a model from a list.
// Models are displayed alphabetically. Uses model ID as the option value to avoid
// index-based bugs when list order changes.
// Returns the selected model ID.
func DisplayModelSelectionMenu(models []string, providerName string) (string, error) {
	if len(models) == 0 {
		return "", fmt.Errorf("no models available for selection")
	}

	// Use model ID as the value (not index) to avoid positional coupling bugs
	var selectedModel string
	options := make([]huh.Option[string], len(models))
	for i, model := range models {
		options[i] = huh.NewOption(model, model)
	}

	title := fmt.Sprintf("Select a %s model", providerName)

	form := huh.NewForm(
		huh.NewGroup(
			huh.NewSelect[string]().
				Title(title).
				Options(options...).
				Height(calculateSelectHeight()).
				Filtering(true).
				Value(&selectedModel),
		),
	)

	if err := form.Run(); err != nil {
		return "", fmt.Errorf("failed to select model: %w", err)
	}

	return selectedModel, nil
}

// ConvertModelsMapToSlice converts a map of models to a sorted slice of model IDs.
// This is useful for displaying models in a consistent order in UI components.
func ConvertModelsMapToSlice(models map[string]interface{}) []string {
	result := make([]string, 0, len(models))
	for modelID := range models {
		result = append(result, modelID)
	}

	// Sort alphabetically for consistent display
	sort.Strings(result)

	return result
}

// ConvertOcaModelsToInterface converts Oca model map to generic interface map.
// This allows Oca and Cline models to be used with the generic fetching utilities.
func ConvertOcaModelsToInterface(models map[string]*cline.OcaModelInfo) map[string]interface{} {
	result := make(map[string]interface{}, len(models))
	for k, v := range models {
		result[k] = v
	}
	return result
}

// getTerminalHeight returns the terminal height (rows)
func getTerminalHeight() int {
	_, height, err := term.GetSize(int(os.Stdout.Fd()))
	if err != nil || height <= 0 {
		return 25 // safe fallback for non-TTY or errors
	}
	return height
}

// calculateSelectHeight computes appropriate height for Select component
// Reserves space for title, search UI, and margins
func calculateSelectHeight() int {
	height := getTerminalHeight()
	// Reserve ~10 rows for UI chrome (title, search, margins)
	visibleRows := height - 10
	// Clamp between 8 (minimum usable) and 25 (maximum before unwieldy)
	if visibleRows < 8 {
		return 8
	}
	if visibleRows > 25 {
		return 25
	}
	return visibleRows
}
