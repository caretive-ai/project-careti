// CARET MODIFICATION: Caret feature configuration system
// 캐럿 기능 설정을 관리하는 시스템

// CARET MODIFICATION: Static import for feature configuration
import featureConfigData from "./feature-config.json"

export interface FeatureConfig {
	/** 페르소나 설정 표시 여부 */
	showPersonaSettings: boolean
	/** 페르소나 시스템 기본 활성화 상태 */
	defaultPersonaEnabled: boolean
	/** API 설정 완료 후 이동할 위치 */
	redirectAfterApiSetup: "persona" | "home"
	/** 기본 모드 시스템 */
	defaultModeSystem: "caret" | "cline"
	/** API 설정 화면에 최상단에 노출할 프로바이더 */
	firstListingProvider: string
	/** 기본 프로바이더 */
	defaultProvider: string
	/** 기본 프로바이더만 표시할지 여부 */
	showOnlyDefaultProvider: boolean
	/** 비용 정보 표시 여부 */
	showCostInformation: boolean
	// 향후 추가될 기능별 옵션들
}

// 현재 기능 설정을 가져오는 함수
export function getCurrentFeatureConfig(): FeatureConfig {
	// 정적 설정을 직접 반환 (JSON 파일 자체가 완전한 설정)
	return featureConfigData as FeatureConfig
}

