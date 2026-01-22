import { cn } from "@heroui/react"
import { TranscribeAudioRequest } from "@shared/proto/cline/dictation"
import { EmptyRequest } from "@shared/proto/index.cline"
import { SquareIcon, StopCircleIcon } from "lucide-react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { t } from "@/careti/utils/i18n"
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

	const handleStartClick = useCallback(() => {
		if (disabled || isProcessing || isStarting) {
			return
		}
		if (error) {
			setError(null)
			return
		}
		startRecording()
	}, [disabled, isProcessing, isStarting, error, startRecording])

	const handleStopClick = useCallback(() => {
		if (disabled || isProcessing) {
			return
		}
		stopRecording()
	}, [disabled, isProcessing, stopRecording])

	const handleCancelClick = useCallback(() => {
		if (disabled || isProcessing) {
			return
		}
		cancelRecording()
	}, [disabled, isProcessing, cancelRecording])

	const iconAdjustment = isProcessing || isStarting ? "mt-0" : error ? "mt-1" : "mt-0.5"

	// Render a single mic button when idle/processing
	if (!isRecording) {
		const iconClass = isProcessing || isStarting ? "codicon-loading" : error ? "codicon-error" : "codicon-mic"
		const iconColor = error ? "text-error" : ""
		const tooltipContent = isProcessing
			? "Transcribing..."
			: isStarting
				? "Starting recording..."
				: error
					? `Error: ${error}`
					: "Voice Input"

		return (
			<div
				className={cn("pt-1 input-icon-button mr-1.5 text-base", iconAdjustment, {
					disabled: disabled || isProcessing || isStarting,
					"animate-spin": isProcessing || isStarting,
				})}
				data-testid="voice-recorder-start-button"
				onClick={handleStartClick}
				style={{ color: iconColor }}
				title={tooltipContent}>
				<span className={`codicon ${iconClass}`} />
			</div>
		)
	}

	// Recording state: show stop/cancel buttons with timers
	return (
		<div className={cn("flex items-center mb-2", { "mr-0.5": isRecording, "mr-1.5": !isRecording })}>
			<div
				className={cn("input-icon-button p-1 m-0 mr-1.5 text-base", iconAdjustment, {
					disabled: disabled || isProcessing,
					"animate-spin": isProcessing || isStarting,
				})}
				data-testid="stop-recording-button"
				onClick={handleStopClick}
				title={`Stop Recording (${formatSeconds(recordingDuration)}/${formatSeconds(MAX_DURATION)})`}>
				<StopCircleIcon />
			</div>

			<div
				className={cn("input-icon-button p-1 m-0 text-base text-error", iconAdjustment, {
					"animate-spin": isProcessing || isStarting,
					disabled: disabled || isProcessing,
				})}
				data-testid="cancel-recording-button"
				onClick={handleCancelClick}
				title={t("voiceRecorder.cancelRecording", "chat")}>
				<SquareIcon />
			</div>
		</div>
	)
}

export default VoiceRecorder
