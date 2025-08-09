/**
 * CARET MODULE: Caret Provider UI Support
 * 
 * Purpose: Caret 프로바이더 선택 시 표시되는 UI 컴포넌트들을 별도 모듈로 분리
 * Usage: ApiOptions.tsx에서 selectedProvider === "caret"일 때 사용
 */

import React from "react"
import { VSCodeTextField, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { ClineAccountInfoCard } from "../../components/settings/ClineAccountInfoCard"
// import { ModelInfoView } from "../../components/settings/ModelInfoView" // CARET MODIFICATION: Temporarily disabled
import { t } from "../utils/i18n"

interface CaretProviderSupportProps {
	selectedModelId: string
	showModelOptions: boolean
	width: number
	onModelSelect: (modelId: string) => void
}

export const CaretProviderSupport: React.FC<CaretProviderSupportProps> = ({
	selectedModelId,
	showModelOptions,
	width,
	onModelSelect,
}) => {
	return (
		<div>
			{/* CARET MODIFICATION: Caret 프로바이더 개선 - 향후 지원 예정 메시지 및 모델 선택 */}
			<div style={{ marginBottom: 14, marginTop: 4 }}>
				<ClineAccountInfoCard />
			</div>

			{/* 향후 지원 예정 메시지 */}
			<div
				style={{
					padding: "10px",
					borderRadius: "4px",
					marginBottom: "10px",
				}}>
				<p
					style={{
						margin: 0,
						fontSize: "13px",
						color: "var(--vscode-descriptionForeground)",
						fontWeight: "normal",
					}}>
					{t("caretProvider.futureSupport", "common")}
				</p>
			</div>

			{/* CARET MODIFICATION: Caret 프로바이더 전용 모델 버튼 2개 */}
			{showModelOptions && (
				<>
					<div style={{ marginBottom: "8px" }}>
						<label
							style={{
								color: "var(--vscode-foreground)",
								fontSize: "13px",
								fontWeight: "500",
							}}>
							Model
						</label>
					</div>

					{/* 반응형 모델 선택 버튼 2개 */}
					<div
						style={{
							display: "flex",
							gap: "8px",
							flexDirection: width >= 1200 ? "row" : "column",
						}}>
						<div
							onClick={() => onModelSelect("gemini-2.0-flash-exp")}
							style={{
								padding: "12px",
								border: "1px solid var(--vscode-button-border)",
								borderRadius: "4px",
								cursor: "pointer",
								backgroundColor:
									selectedModelId === "gemini-2.0-flash-exp"
										? "var(--vscode-list-activeSelectionBackground)"
										: "transparent",
								flex: width >= 1200 ? "1" : "none",
							}}>
							<div style={{ fontWeight: "500", marginBottom: "4px" }}>
								Gemini 2.0 Flash (Experimental)
							</div>
							<div
								style={{
									fontSize: "12px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								Google's latest multimodal model
							</div>
						</div>

						<div
							onClick={() => onModelSelect("gemini-1.5-pro")}
							style={{
								padding: "12px",
								border: "1px solid var(--vscode-button-border)",
								borderRadius: "4px",
								cursor: "pointer",
								backgroundColor:
									selectedModelId === "gemini-1.5-pro"
										? "var(--vscode-list-activeSelectionBackground)"
										: "transparent",
								flex: width >= 400 ? "1" : "none",
							}}>
							<div style={{ fontWeight: "500", marginBottom: "4px" }}>
								Gemini 1.5 Pro
							</div>
							<div
								style={{
									fontSize: "12px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								Advanced reasoning and analysis
							</div>
						</div>
					</div>
				</>
			)}

			{/* CARET MODIFICATION: ModelInfoView temporarily disabled */}
			{showModelOptions && selectedModelId && (
				<div style={{ padding: "8px", fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
					Selected Model: {selectedModelId}
				</div>
			)}
		</div>
	)
}
