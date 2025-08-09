import { UpdateBrowserSettingsRequest } from "@shared/proto/browser"
import { EmptyRequest, StringRequest } from "@shared/proto/common"
import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import debounce from "debounce"
import React, { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { BROWSER_VIEWPORT_PRESETS } from "../../../../src/shared/BrowserSettings"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { BrowserServiceClient } from "../../services/grpc-client"
// CARET MODIFICATION: 다국어 지원 추가
import { t, type SupportedLanguage } from "../../caret/utils/i18n"
import { useCurrentLanguage } from "../../caret/hooks/useCurrentLanguage"

const ConnectionStatusIndicator = ({
	isChecking,
	isConnected,
	remoteBrowserEnabled,
	currentLanguage,
}: {
	isChecking: boolean
	isConnected: boolean | null
	remoteBrowserEnabled?: boolean
	currentLanguage: SupportedLanguage
}) => {
	if (!remoteBrowserEnabled) return null

	return (
		<StatusContainer>
			{isChecking ? (
				<>
					<Spinner />
					<StatusText>{t("browser.checkingConnection", "settings", currentLanguage)}</StatusText>
				</>
			) : isConnected === true ? (
				<>
					<CheckIcon className="codicon codicon-check" />
					<StatusText style={{ color: "var(--vscode-terminal-ansiGreen)" }}>{t("browser.connected", "settings", currentLanguage)}</StatusText>
				</>
			) : isConnected === false ? (
				<StatusText style={{ color: "var(--vscode-errorForeground)" }}>{t("browser.notConnected", "settings", currentLanguage)}</StatusText>
			) : null}
		</StatusContainer>
	)
}

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
	overflow: hidden;
	transition:
		max-height 0.3s ease-in-out,
		opacity 0.3s ease-in-out,
		margin-top 0.3s ease-in-out,
		visibility 0.3s ease-in-out;
	max-height: ${({ isOpen }) => (isOpen ? "1000px" : "0")}; // Sufficiently large height
	opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
	margin-top: ${({ isOpen }) => (isOpen ? "15px" : "0")};
	visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
`

export const BrowserSettingsSection: React.FC = () => {
	// CARET MODIFICATION: 현재 언어 추가
	const currentLanguage = useCurrentLanguage()
	const { browserSettings } = useExtensionState()
	const [localChromePath, setLocalChromePath] = useState(browserSettings.chromeExecutablePath || "")
	const [isCheckingConnection, setIsCheckingConnection] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
	const [relaunchResult, setRelaunchResult] = useState<{ success: boolean; message: string } | null>(null)
	const [debugMode, setDebugMode] = useState(false)
	const [isBundled, setIsBundled] = useState(false)
	const [detectedChromePath, setDetectedChromePath] = useState<string | null>(null)

	// Auto-clear relaunch result message after 15 seconds
	useEffect(() => {
		if (relaunchResult) {
			const timer = setTimeout(() => {
				setRelaunchResult(null)
			}, 15000)

			// Clear timeout if component unmounts or relaunchResult changes
			return () => clearTimeout(timer)
		}
	}, [relaunchResult])

	// Request detected Chrome path on mount
	useEffect(() => {
		// Use gRPC for getDetectedChromePath
		BrowserServiceClient.getDetectedChromePath(EmptyRequest.create({}))
			.then((result) => {
				setDetectedChromePath(result.path)
				setIsBundled(result.isBundled)
			})
			.catch((error) => {
				console.error("Error getting detected Chrome path:", error)
			})
	}, [])

	// Sync localChromePath with global state
	useEffect(() => {
		if (browserSettings.chromeExecutablePath !== localChromePath) {
			setLocalChromePath(browserSettings.chromeExecutablePath || "")
		}
		// Removed sync for local disableToolUse state
	}, [browserSettings.chromeExecutablePath, browserSettings.disableToolUse])

	// Debounced connection check function
	const debouncedCheckConnection = useCallback(
		debounce(() => {
			if (browserSettings.remoteBrowserEnabled) {
				setIsCheckingConnection(true)
				setConnectionStatus(null)
				if (browserSettings.remoteBrowserHost) {
					// Use gRPC for testBrowserConnection
					BrowserServiceClient.testBrowserConnection(StringRequest.create({ value: browserSettings.remoteBrowserHost }))
						.then((result) => {
							setConnectionStatus(result.success)
							setIsCheckingConnection(false)
						})
						.catch((error) => {
							console.error("Error testing browser connection:", error)
							setConnectionStatus(false)
							setIsCheckingConnection(false)
						})
				} else {
					BrowserServiceClient.discoverBrowser(EmptyRequest.create({}))
						.then((result) => {
							setConnectionStatus(result.success)
							setIsCheckingConnection(false)
						})
						.catch((error) => {
							console.error("Error discovering browser:", error)
							setConnectionStatus(false)
							setIsCheckingConnection(false)
						})
				}
			}
		}, 1000),
		[browserSettings.remoteBrowserEnabled, browserSettings.remoteBrowserHost],
	)

	// Check connection when component mounts or when remote settings change
	useEffect(() => {
		if (browserSettings.remoteBrowserEnabled) {
			debouncedCheckConnection()
		} else {
			setConnectionStatus(null)
		}
	}, [browserSettings.remoteBrowserEnabled, browserSettings.remoteBrowserHost, debouncedCheckConnection])

	const handleViewportChange = (event: any) => {
		const target = event.target as HTMLSelectElement
		const selectedSize = BROWSER_VIEWPORT_PRESETS[target.value as keyof typeof BROWSER_VIEWPORT_PRESETS]
		if (selectedSize) {
			BrowserServiceClient.updateBrowserSettings(
				UpdateBrowserSettingsRequest.create({
					metadata: {},
					viewport: {
						width: selectedSize.width,
						height: selectedSize.height,
					},
					remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
					remoteBrowserHost: browserSettings.remoteBrowserHost,
					chromeExecutablePath: browserSettings.chromeExecutablePath,
					disableToolUse: browserSettings.disableToolUse,
				}),
			)
				.then((response) => {
					if (!response.value) {
						console.error("Failed to update browser settings")
					}
				})
				.catch((error) => {
					console.error("Error updating browser settings:", error)
				})
		}
	}

	const updateRemoteBrowserEnabled = (enabled: boolean) => {
		BrowserServiceClient.updateBrowserSettings(
			UpdateBrowserSettingsRequest.create({
				metadata: {},
				viewport: {
					width: browserSettings.viewport.width,
					height: browserSettings.viewport.height,
				},
				remoteBrowserEnabled: enabled,
				// If disabling, also clear the host
				remoteBrowserHost: enabled ? browserSettings.remoteBrowserHost : undefined,
				chromeExecutablePath: browserSettings.chromeExecutablePath,
				disableToolUse: browserSettings.disableToolUse,
			}),
		)
			.then((response) => {
				if (!response.value) {
					console.error("Failed to update browser settings")
				}
			})
			.catch((error) => {
				console.error("Error updating browser settings:", error)
			})
	}

	const updateRemoteBrowserHost = (host: string | undefined) => {
		BrowserServiceClient.updateBrowserSettings(
			UpdateBrowserSettingsRequest.create({
				metadata: {},
				viewport: {
					width: browserSettings.viewport.width,
					height: browserSettings.viewport.height,
				},
				remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
				remoteBrowserHost: host,
				chromeExecutablePath: browserSettings.chromeExecutablePath,
				disableToolUse: browserSettings.disableToolUse,
			}),
		)
			.then((response) => {
				if (!response.value) {
					console.error("Failed to update browser settings")
				}
			})
			.catch((error) => {
				console.error("Error updating browser settings:", error)
			})
	}

	const debouncedUpdateChromePath = useCallback(
		debounce((newPath: string | undefined) => {
			BrowserServiceClient.updateBrowserSettings(
				UpdateBrowserSettingsRequest.create({
					metadata: {},
					viewport: {
						width: browserSettings.viewport.width,
						height: browserSettings.viewport.height,
					},
					remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
					remoteBrowserHost: browserSettings.remoteBrowserHost,
					chromeExecutablePath: newPath,
					disableToolUse: browserSettings.disableToolUse,
				}),
			)
				.then((response) => {
					if (!response.value) {
						console.error("Failed to update browser settings for chromeExecutablePath")
					}
				})
				.catch((error) => {
					console.error("Error updating browser settings for chromeExecutablePath:", error)
				})
		}, 500),
		[browserSettings],
	)

	const updateChromeExecutablePath = (path: string | undefined) => {
		BrowserServiceClient.updateBrowserSettings(
			UpdateBrowserSettingsRequest.create({
				metadata: {},
				viewport: {
					width: browserSettings.viewport.width,
					height: browserSettings.viewport.height,
				},
				remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
				remoteBrowserHost: browserSettings.remoteBrowserHost,
				chromeExecutablePath: path,
				disableToolUse: browserSettings.disableToolUse,
			}),
		)
			.then((response) => {
				if (!response.value) {
					console.error("Failed to update browser settings")
				}
			})
			.catch((error) => {
				console.error("Error updating browser settings:", error)
			})
	}

	// Function to check connection once without changing UI state immediately
	const checkConnectionOnce = useCallback(() => {
		// Don't show the spinner for every check to avoid UI flicker
		// We'll rely on the response to update the connectionStatus
		if (browserSettings.remoteBrowserHost) {
			// Use gRPC for testBrowserConnection
			BrowserServiceClient.testBrowserConnection(StringRequest.create({ value: browserSettings.remoteBrowserHost }))
				.then((result) => {
					setConnectionStatus(result.success)
				})
				.catch((error) => {
					console.error("Error testing browser connection:", error)
					setConnectionStatus(false)
				})
		} else {
			BrowserServiceClient.discoverBrowser(EmptyRequest.create({}))
				.then((result) => {
					setConnectionStatus(result.success)
				})
				.catch((error) => {
					console.error("Error discovering browser:", error)
					setConnectionStatus(false)
				})
		}
	}, [browserSettings.remoteBrowserHost])

	// Setup continuous polling for connection status when remote browser is enabled
	useEffect(() => {
		// Only poll if remote browser mode is enabled
		if (!browserSettings.remoteBrowserEnabled) {
			// Make sure we're not showing checking state when disabled
			setIsCheckingConnection(false)
			return
		}

		// Check immediately when enabled
		checkConnectionOnce()

		// Then check every second
		const pollInterval = setInterval(() => {
			checkConnectionOnce()
		}, 1000)

		// Cleanup the interval if the component unmounts or remote browser is disabled
		return () => clearInterval(pollInterval)
	}, [browserSettings.remoteBrowserEnabled, checkConnectionOnce])

	const updateDisableToolUse = (disabled: boolean) => {
		BrowserServiceClient.updateBrowserSettings(
			UpdateBrowserSettingsRequest.create({
				metadata: {},
				viewport: {
					width: browserSettings.viewport.width,
					height: browserSettings.viewport.height,
				},
				remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
				remoteBrowserHost: browserSettings.remoteBrowserHost,
				chromeExecutablePath: browserSettings.chromeExecutablePath,
				disableToolUse: disabled,
			}),
		)
			.then((response) => {
				if (!response.value) {
					console.error("Failed to update disableToolUse setting")
				}
			})
			.catch((error) => {
				console.error("Error updating disableToolUse setting:", error)
			})
	}

	const relaunchChromeDebugMode = () => {
		setDebugMode(true)
		setRelaunchResult(null)
		// The connection status will be automatically updated by our polling

		BrowserServiceClient.relaunchChromeDebugMode(EmptyRequest.create({}))
			.then((result) => {
				setRelaunchResult({
					success: result.success,
					message: result.message,
				})
				setDebugMode(false)
			})
			.catch((error) => {
				console.error("Error relaunching Chrome:", error)
				setRelaunchResult({
					success: false,
					message: `Error relaunching Chrome: ${error.message}`,
				})
				setDebugMode(false)
			})
	}

	// Determine if we should show the relaunch button
	const isRemoteEnabled = Boolean(browserSettings.remoteBrowserEnabled)
	const shouldShowRelaunchButton = isRemoteEnabled && connectionStatus === false
	const isSubSettingsOpen = !(browserSettings.disableToolUse || false)

	return (
		<div className="flex flex-col gap-5">
			{/* Remote Browser Connection */}
			<div className="flex flex-col gap-2">
				<VSCodeCheckbox
					checked={browserSettings.remoteBrowserEnabled}
					onChange={(e: any) => updateRemoteBrowserEnabled(e.target.checked)}>
					{t("browser.remoteBrowserEnabled", "settings", currentLanguage)}
				</VSCodeCheckbox>
				<CollapsibleContent isOpen={!!browserSettings.remoteBrowserEnabled}>
					<div className="ml-[24px] flex flex-col gap-4">
						{/* Connection Host */}
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium">{t("browser.remoteBrowserHost", "settings", currentLanguage)}</label>
							<VSCodeTextField
								placeholder="ws://127.0.0.1:9222"
								value={browserSettings.remoteBrowserHost || ""}
								onChange={(e: any) => updateRemoteBrowserHost(e.target.value)} />
							<ConnectionStatusIndicator
								isChecking={isCheckingConnection}
								isConnected={connectionStatus}
								remoteBrowserEnabled={browserSettings.remoteBrowserEnabled}
								currentLanguage={currentLanguage}
							/>
							<p className="text-xs text-[var(--vscode-descriptionForeground)]">
								{t("browser.remoteBrowserDescription", "settings", currentLanguage)}
							</p>
							<VSCodeButton
								onClick={relaunchChromeDebugMode}
								className="w-auto flex-shrink-0" // Add flex-shrink-0 to prevent button from expanding
								disabled={relaunchResult?.success === false}>
								{t("browser.launchBrowser", "settings", currentLanguage)}
							</VSCodeButton>
							{relaunchResult && (
								<p
									className="text-xs mt-2"
									style={{
										color: relaunchResult.success ? "var(--vscode-terminal-ansiGreen)" : "var(--vscode-errorForeground)",
									}}>
									{relaunchResult.message}
								</p>
							)}
						</div>

						{/* Chrome Executable Path */}
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium">{t("browser.chromeExecutablePath", "settings", currentLanguage)}</label>
							<VSCodeTextField
								placeholder="path/to/chrome.exe"
								value={localChromePath}
								onChange={(e: any) => setLocalChromePath(e.target.value)}
								onBlur={(e: any) => updateChromeExecutablePath(e.target.value)} />
							{detectedChromePath && !isBundled && (
								<p className="text-xs text-[var(--vscode-descriptionForeground)]">
									{t("browser.detectedChromePath", "settings", currentLanguage)}: <code>{detectedChromePath}</code>
								</p>
							)}
							{isBundled && (
								<p className="text-xs text-[var(--vscode-descriptionForeground)]">
									{t("browser.customChromePath", "settings", currentLanguage)}
								</p>
							)}
						</div>

						{/* Disable Tool Use */}
						<VSCodeCheckbox
							checked={browserSettings.disableToolUse}
							onChange={(e: any) => updateDisableToolUse(e.target.checked)}>
							{t("browser.disableToolUse", "settings", currentLanguage)}
						</VSCodeCheckbox>

						{/* Viewport Size */}
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium">{t("browser.viewportWidth", "settings", currentLanguage)} / {t("browser.viewportHeight", "settings", currentLanguage)}</label>
							<VSCodeDropdown
								value={`${browserSettings.viewport.width}x${browserSettings.viewport.height}`}
								onChange={handleViewportChange}>
								{Object.entries(BROWSER_VIEWPORT_PRESETS).map(([key, value]) => (
									<VSCodeOption key={key} value={key}>
										{key}
									</VSCodeOption>
								))}
							</VSCodeDropdown>
						</div>
					</div>
				</CollapsibleContent>
			</div>
		</div>
	)
}

const StatusContainer = styled.div`
	display: flex;
	align-items: center;
	margin-left: 12px;
	height: 20px;
`

const StatusText = styled.span`
	font-size: 12px;
	margin-left: 4px;
`

const CheckIcon = styled.i`
	color: var(--vscode-terminal-ansiGreen);
	font-size: 14px;
`

const Spinner = styled.div`
	width: 14px;
	height: 14px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	border-top-color: var(--vscode-progressBar-background);
	animation: spin 1s ease-in-out infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`

export default BrowserSettingsSection
