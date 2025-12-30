package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/cline/cli/pkg/cli/global"
	"github.com/cline/cli/pkg/cli/task"
	"github.com/cline/cli/pkg/common"
	"github.com/cline/cli/pkg/generated"
	"github.com/cline/grpc-go/cline"
	"google.golang.org/protobuf/proto"
)

// DefaultCaretModelID is the default model ID for the Caret provider.
const DefaultCaretModelID = "gemini/gemini-2.5-flash"
const DefaultCaretBaseURL = "https://api.caret.team"

func generatedModelInfoToCaretModelInfo(modelInfo generated.ModelInfo) *cline.CaretModelInfo {
	return &cline.CaretModelInfo{
		MaxTokens:           proto.Int64(int64(modelInfo.MaxTokens)),
		ContextWindow:       proto.Int64(int64(modelInfo.ContextWindow)),
		SupportsImages:      proto.Bool(modelInfo.SupportsImages),
		SupportsPromptCache: modelInfo.SupportsPromptCache,
		InputPrice:          proto.Float64(modelInfo.InputPrice),
		OutputPrice:         proto.Float64(modelInfo.OutputPrice),
		CacheWritesPrice:    proto.Float64(modelInfo.CacheWritesPrice),
		CacheReadsPrice:     proto.Float64(modelInfo.CacheReadsPrice),
		Description:         proto.String(modelInfo.Description),
	}
}

// FetchCaretModels returns the static Caret model list embedded in the CLI build.
func FetchCaretModels() (map[string]*cline.CaretModelInfo, error) {
	if global.Config != nil && global.Config.Verbose {
		fmt.Printf("Fetching %s models (static)\n", common.BrandDisplayName())
	}

	modelIDs, modelInfos, err := FetchStaticModels(cline.ApiProvider_CARET)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch %s models: %w", common.BrandDisplayName(), err)
	}

	models := make(map[string]*cline.CaretModelInfo, len(modelInfos))
	for _, modelID := range modelIDs {
		info, ok := modelInfos[modelID]
		if !ok {
			continue
		}
		models[modelID] = generatedModelInfoToCaretModelInfo(info)
	}

	return models, nil
}

func GetCaretModelInfo(modelID string, models map[string]*cline.CaretModelInfo) (*cline.CaretModelInfo, error) {
	modelInfo, exists := models[modelID]
	if !exists {
		return nil, fmt.Errorf("model %s not found", modelID)
	}
	return modelInfo, nil
}

// SetDefaultCaretModel configures the default Caret model after authentication
func SetDefaultCaretModel(ctx context.Context, manager *task.Manager) error {
	models, err := FetchCaretModels()
	if err != nil {
		fmt.Printf("Warning: Could not fetch %s models: %v\n", common.BrandDisplayName(), err)
		fmt.Printf("Using default model: %s\n", DefaultCaretModelID)
		return applyDefaultCaretModel(ctx, manager, nil)
	}

	modelInfo, err := GetCaretModelInfo(DefaultCaretModelID, models)
	if err == nil {
		if err := applyCaretModelConfiguration(ctx, manager, DefaultCaretModelID, modelInfo); err != nil {
			return err
		}
	} else {
		modelIDs := ConvertModelsMapToSlice(ConvertCaretModelsToInterface(models))
		if len(modelIDs) > 0 {
			selectedID := modelIDs[0]
			fmt.Printf("Using available %s model: %s\n", common.BrandDisplayName(), selectedID)
			if err := applyCaretModelConfiguration(ctx, manager, selectedID, models[selectedID]); err != nil {
				return err
			}
		}
	}

	if err := setCaretWelcomeViewCompletedWithManager(ctx, manager); err != nil {
		verboseLog("Warning: Failed to mark welcome view as completed: %v", err)
	}

	return nil
}

// SelectCaretModel presents a menu to select a Caret model and applies the configuration.
func SelectCaretModel(ctx context.Context, manager *task.Manager) error {
	models, err := FetchCaretModels()
	if err != nil {
		return fmt.Errorf("failed to fetch %s models: %w", common.BrandDisplayName(), err)
	}

	modelIDs := ConvertModelsMapToSlice(ConvertCaretModelsToInterface(models))
	selectedModelID, err := DisplayModelSelectionMenu(modelIDs, common.BrandDisplayName())
	if err != nil {
		return fmt.Errorf("model selection failed: %w", err)
	}

	modelInfo := models[selectedModelID]
	if err := applyCaretModelConfiguration(ctx, manager, selectedModelID, modelInfo); err != nil {
		return err
	}

	fmt.Println()
	return HandleAuthMenuNoArgs(ctx)
}

func ConvertCaretModelsToInterface(models map[string]*cline.CaretModelInfo) map[string]interface{} {
	result := make(map[string]interface{}, len(models))
	for k, v := range models {
		result[k] = v
	}
	return result
}

func applyCaretModelConfiguration(ctx context.Context, manager *task.Manager, modelID string, modelInfo *cline.CaretModelInfo) error {
	provider := cline.ApiProvider_CARET
	baseURL := DefaultCaretBaseURL
	thinkingBudget := int64(0)

	updates := ProviderUpdatesPartial{
		ModelID:              &modelID,
		ModelInfo:            modelInfo,
		BaseURL:              &baseURL,
		ThinkingBudgetTokens: &thinkingBudget,
	}

	return UpdateProviderPartial(ctx, manager, provider, updates, true)
}

func applyDefaultCaretModel(ctx context.Context, manager *task.Manager, modelInfo *cline.CaretModelInfo) error {
	if err := applyCaretModelConfiguration(ctx, manager, DefaultCaretModelID, modelInfo); err != nil {
		return err
	}

	if err := setCaretWelcomeViewCompletedWithManager(ctx, manager); err != nil {
		verboseLog("Warning: Failed to mark welcome view as completed: %v", err)
	}

	return nil
}

func setCaretWelcomeViewCompletedWithManager(ctx context.Context, manager *task.Manager) error {
	_, err := manager.GetClient().State.SetWelcomeViewCompleted(ctx, &cline.BooleanRequest{Value: true})
	return err
}

func hasConfiguredCaretModelIDs(apiConfig map[string]interface{}) bool {
	if apiConfig == nil {
		return false
	}
	planModelID := getProviderSpecificModelID(apiConfig, "plan", cline.ApiProvider_CARET)
	actModelID := getProviderSpecificModelID(apiConfig, "act", cline.ApiProvider_CARET)
	return planModelID != "" || actModelID != ""
}

func caretHasExistingModel(ctx context.Context, manager *task.Manager) bool {
	providers, err := GetProviderConfigurations(ctx, manager)
	if err != nil || providers == nil || providers.apiConfig == nil {
		return false
	}

	return hasConfiguredCaretModelIDs(providers.apiConfig)
}

func clearCaretLocalSession() {
	configDir := ""
	if global.Config != nil && global.Config.ConfigPath != "" {
		configDir = global.Config.ConfigPath
	} else {
		if path, err := common.DefaultConfigPath(); err == nil {
			configDir = path
		}
	}
	if configDir == "" {
		return
	}

	dataDir := filepath.Join(configDir, "data")
	paths := []string{
		filepath.Join(dataDir, "secrets.json"),
		filepath.Join(dataDir, "globalState.json"),
	}
	keys := []string{"caret:caretAccountId", "caretAccountId", "userInfo"}

	for _, path := range paths {
		payload, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		var data map[string]interface{}
		if err := json.Unmarshal(payload, &data); err != nil {
			continue
		}
		changed := false
		for _, key := range keys {
			if _, ok := data[key]; ok {
				delete(data, key)
				changed = true
			}
		}
		if !changed {
			continue
		}
		updated, err := json.MarshalIndent(data, "", "  ")
		if err != nil {
			continue
		}
		_ = os.MkdirAll(filepath.Dir(path), 0755)
		_ = os.WriteFile(path, updated, 0644)
	}
}
