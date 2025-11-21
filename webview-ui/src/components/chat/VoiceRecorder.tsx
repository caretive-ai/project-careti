import { TranscribeAudioRequest } from "@shared/proto/cline/dictation"
import { EmptyRequest } from "@shared/proto/index.cline"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { SquareIcon, StopCircleIcon } from "lucide-react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { DictationServiceClient } from "@/services/grpc-client"
import { formatSeconds } from "@/utils/format"

interface VoiceRecorderProps {
	onTranscription: (text: string) => void
	onProcessingStateChange?: (isProcessing: boolean, message?: string) => void
	onRecordingStateChange?: (isRecording: boolean) => void
	disabled?: boolean
	language?: string
	isAuthenticated?: boolean
}

const MAX_DURATION = 5 * 60 // 5 minutes in seconds

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
	onTranscription,
	onProcessingStateChange,
	onRecordingStateChange,
	disabled = false,
	language = "en",
	isAuthenticated = false,
}) => {
	const [isRecording, setIsRecording] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const [isStarting, setIsStarting] = useState(false)
	const [recordingDuration, setRecordingDuration] = useState(0)
	const [error, setError] = useState<string | null>(null)
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		onRecordingStateChange?.(isRecording)
	}, [isRecording, onRecordingStateChange])

	useEffect(() => {
		if (isAuthenticated && error) {
			if (error.toLowerCase().includes("sign in") || error.toLowerCase().includes("cline account")) {
				setError(null)
			}
		}
	}, [isAuthenticated, error])

	const startRecording = useCallback(async () => {
		try {
			setIsStarting(true)
			setError(null)
			onProcessingStateChange?.(false)
			setRecordingDuration(0)

			const response = await DictationServiceClient.startRecording(EmptyRequest.create({}))
			if (!response.success) {
				setError(response.error || "Failed to start recording")
				return
			}
			setIsRecording(true)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to start recording"
			setError(errorMessage)
		} finally {
			setIsStarting(false)
		}
	}, [onProcessingStateChange])

	const stopRecording = useCallback(async () => {
		try {
			setIsRecording(false)
			setIsProcessing(true)
			onProcessingStateChange?.(true, "Processing...")

			const response = await DictationServiceClient.stopRecording(EmptyRequest.create({}))
			if (!response.success) {
				setIsProcessing(false)
				const errorMessage = response.error || "Failed to stop recording"
				setError(errorMessage)
				onTranscription("")
				return
			}

			if (!response.audioBase64) {
				setIsProcessing(false)
				const errorMessage = "No audio data received"
				setError(errorMessage)
				onTranscription("")
				return
			}

			onProcessingStateChange?.(true, "Transcribing...")
			const transcriptionResponse = await DictationServiceClient.transcribeAudio(
				TranscribeAudioRequest.create({
					audioBase64: response.audioBase64,
					language: language,
				}),
			)

			if (transcriptionResponse.error) {
				setError(transcriptionResponse.error)
				onTranscription("")
				setTimeout(() => {
					setError(null)
					onProcessingStateChange?.(false)
				}, 5000)
			} else if (transcriptionResponse.text) {
				setError(null)
				onTranscription(transcriptionResponse.text)
				onProcessingStateChange?.(false)
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "An error occurred"
			setError(errorMessage)
			onTranscription("")
		} finally {
			setIsProcessing(false)
		}
	}, [language, onProcessingStateChange, onTranscription])

	useEffect(() => {
		const pollRecordingStatus = async () => {
			try {
				const statusResponse = await DictationServiceClient.getRecordingStatus(EmptyRequest.create({}))
				if (statusResponse.isRecording) {
					setRecordingDuration(Math.floor(statusResponse.durationSeconds))
					if (statusResponse.durationSeconds >= MAX_DURATION) {
						stopRecording()
					}
				}
			} catch (error) {
				console.error("Error polling recording status:", error)
			}
		}

		if (isRecording && !isProcessing) {
			pollingIntervalRef.current = setInterval(pollRecordingStatus, 1000)
		} else if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current)
			pollingIntervalRef.current = null
		}

		return () => {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current)
				pollingIntervalRef.current = null
			}
		}
	}, [isRecording, isProcessing, stopRecording])

	const cancelRecording = useCallback(async () => {
		try {
			setIsRecording(false)
			setError(null)
			onProcessingStateChange?.(false)
			onTranscription("")
			const response = await DictationServiceClient.cancelRecording(EmptyRequest.create({}))
			if (!response.success) {
				setError(response.error || "Failed to cancel recording")
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to cancel recording"
			setError(errorMessage)
		}
	}, [onProcessingStateChange, onTranscription])

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (!isRecording) {
			return
		}
		if (event.code === "Space") {
			event.preventDefault()
			event.stopPropagation()
			stopRecording()
		}
	}

	return (
		<div className="flex items-center gap-2">
			<VSCodeButton
				appearance="icon"
				aria-label="Hold to talk"
				disabled={disabled || isProcessing || isStarting}
				onKeyDown={handleKeyDown}
				onMouseDown={() => startRecording()}
				onMouseUp={() => stopRecording()}
				onTouchEnd={() => stopRecording()}
				onTouchStart={() => startRecording()}
				style={{
					width: 36,
					height: 36,
					borderRadius: "50%",
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: isRecording ? "var(--vscode-errorForeground)" : "var(--vscode-button-background)",
				}}
				title={`Hold to talk (max 5 min/message). Language: ${language}. ${isAuthenticated ? "" : "Sign in may be required."}`}>
				{isRecording ? <SquareIcon className="h-4 w-4" /> : <StopCircleIcon className="h-4 w-4" />}
			</VSCodeButton>

			{isRecording && (
				<div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--vscode-editor-background)] border border-(--vscode-editorGroup-border)">
					<div className="flex items-center gap-2 text-[var(--vscode-foreground)]">
						<span className="h-2 w-2 rounded-full bg-[var(--vscode-errorForeground)] animate-pulse" />
						<span className="text-xs font-semibold">Recording</span>
					</div>
					<span className="text-xs text-[var(--vscode-descriptionForeground)]">{formatSeconds(recordingDuration)}</span>
					<button className="text-xs underline" onClick={cancelRecording} type="button">
						Cancel
					</button>
				</div>
			)}

			{isProcessing && (
				<div className="text-xs text-[var(--vscode-descriptionForeground)]" role="status">
					Processing audio...
				</div>
			)}

			{error && (
				<div className="text-xs text-[var(--vscode-errorForeground)]" role="alert">
					{error}
				</div>
			)}
		</div>
	)
}

export default VoiceRecorder
