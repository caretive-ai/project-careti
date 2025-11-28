package auth

import (
	"testing"

	"github.com/cline/grpc-go/cline"
	"google.golang.org/protobuf/proto"
)

func TestGetProviderFieldsIncludesCaretAndLiteLLM(t *testing.T) {
	testCases := []struct {
		name                     string
		provider                 cline.ApiProvider
		expectedAPIKeyField      string
		expectedPlanModelField   string
		expectedActModelField    string
		expectedProviderPlanField string
		expectedProviderActField  string
		expectedBaseURLField     string
	}{
		{
			name:                     "LiteLLM fields",
			provider:                 cline.ApiProvider_LITELLM,
			expectedAPIKeyField:      "liteLlmApiKey",
			expectedPlanModelField:   "planModeApiModelId",
			expectedActModelField:    "actModeApiModelId",
			expectedProviderPlanField: "planModeLiteLlmModelId",
			expectedProviderActField:  "actModeLiteLlmModelId",
			expectedBaseURLField:     "liteLlmBaseUrl",
		},
		{
			name:                     "Caret fields",
			provider:                 cline.ApiProvider_CARET,
			expectedAPIKeyField:      "caretApiKey",
			expectedPlanModelField:   "planModeApiModelId",
			expectedActModelField:    "actModeApiModelId",
			expectedProviderPlanField: "planModeCaretModelId",
			expectedProviderActField:  "actModeCaretModelId",
			expectedBaseURLField:     "caretBaseUrl",
		},
		{
			name:                     "BizRouter fields",
			provider:                 cline.ApiProvider_BIZROUTER,
			expectedAPIKeyField:      "bizRouterApiKey",
			expectedPlanModelField:   "planModeApiModelId",
			expectedActModelField:    "actModeApiModelId",
			expectedProviderPlanField: "planModeBizRouterModelId",
			expectedProviderActField:  "actModeBizRouterModelId",
			expectedBaseURLField:     "",
		},
	}

	for _, tc := range testCases {
		fields, err := GetProviderFields(tc.provider)
		if err != nil {
			t.Fatalf("%s: expected fields, got error: %v", tc.name, err)
		}

		if fields.APIKeyField != tc.expectedAPIKeyField {
			t.Errorf("%s: APIKeyField = %s, want %s", tc.name, fields.APIKeyField, tc.expectedAPIKeyField)
		}
		if fields.PlanModeModelIDField != tc.expectedPlanModelField {
			t.Errorf("%s: PlanModeModelIDField = %s, want %s", tc.name, fields.PlanModeModelIDField, tc.expectedPlanModelField)
		}
		if fields.ActModeModelIDField != tc.expectedActModelField {
			t.Errorf("%s: ActModeModelIDField = %s, want %s", tc.name, fields.ActModeModelIDField, tc.expectedActModelField)
		}
		if fields.PlanModeProviderSpecificModelIDField != tc.expectedProviderPlanField {
			t.Errorf("%s: PlanModeProviderSpecificModelIDField = %s, want %s", tc.name, fields.PlanModeProviderSpecificModelIDField, tc.expectedProviderPlanField)
		}
		if fields.ActModeProviderSpecificModelIDField != tc.expectedProviderActField {
			t.Errorf("%s: ActModeProviderSpecificModelIDField = %s, want %s", tc.name, fields.ActModeProviderSpecificModelIDField, tc.expectedProviderActField)
		}
		if fields.BaseURLField != tc.expectedBaseURLField {
			t.Errorf("%s: BaseURLField = %s, want %s", tc.name, fields.BaseURLField, tc.expectedBaseURLField)
		}
	}
}

func TestGetProviderDisplayNameReturnsNewLabels(t *testing.T) {
	testCases := map[cline.ApiProvider]string{
		cline.ApiProvider_CARET:     "Caret (Official)",
		cline.ApiProvider_LITELLM:   "LiteLLM",
		cline.ApiProvider_BIZROUTER: "BizRouter",
	}

	for provider, expected := range testCases {
		if got := GetProviderDisplayName(provider); got != expected {
			t.Errorf("GetProviderDisplayName(%v) = %s, want %s", provider, got, expected)
		}
	}
}

func TestGetBYOProviderListIncludesLiteLLM(t *testing.T) {
	providers := GetBYOProviderList()
	foundLiteLlm := false
	for _, provider := range providers {
		if provider.Provider == cline.ApiProvider_LITELLM {
			foundLiteLlm = provider.Name == "LiteLLM"
			break
		}
	}

	if !foundLiteLlm {
		t.Fatalf("LiteLLM provider missing from BYO provider list")
	}
}

func TestSetProviderSpecificModelIDSetsNewProviders(t *testing.T) {
	modelID := proto.String("demo-model")
	cfg := &cline.ModelsApiConfiguration{}

	setProviderSpecificModelID(cfg, "planModeLiteLlmModelId", modelID)
	if cfg.GetPlanModeLiteLlmModelId() != *modelID || cfg.GetActModeLiteLlmModelId() != *modelID {
		t.Errorf("LiteLLM model IDs not set correctly: plan=%s act=%s", cfg.GetPlanModeLiteLlmModelId(), cfg.GetActModeLiteLlmModelId())
	}

	setProviderSpecificModelID(cfg, "planModeCaretModelId", modelID)
	if cfg.GetPlanModeCaretModelId() != *modelID || cfg.GetActModeCaretModelId() != *modelID {
		t.Errorf("Caret model IDs not set correctly: plan=%s act=%s", cfg.GetPlanModeCaretModelId(), cfg.GetActModeCaretModelId())
	}

	setProviderSpecificModelID(cfg, "planModeBizRouterModelId", modelID)
	if cfg.GetPlanModeBizRouterModelId() != *modelID || cfg.GetActModeBizRouterModelId() != *modelID {
		t.Errorf("BizRouter model IDs not set correctly: plan=%s act=%s", cfg.GetPlanModeBizRouterModelId(), cfg.GetActModeBizRouterModelId())
	}
}
