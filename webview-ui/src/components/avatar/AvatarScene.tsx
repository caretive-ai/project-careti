// CARETI MODIFICATION: 아바타 3D 씬 컴포넌트
import { useEffect, useRef, useState } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { useVRMLoader } from "../../hooks/avatar"
import welcomeBg from "../../careti/assets/welcome-banner.webp"
import { VRMAvatar } from "./VRMAvatar"
import type { AvatarState } from "./AvatarStatus"

// 카메라 위치 및 타겟 표시
function CameraLogger({ onUpdate, controlsRef }: { onUpdate: (pos: string) => void, controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
	const { camera } = useThree()
	const lastLog = useRef(0)

	useFrame(() => {
		const now = Date.now()
		if (now - lastLog.current > 300) {
			const pos = camera.position
			const target = controlsRef.current?.target
			const targetStr = target ? `t:(${target.x.toFixed(2)},${target.y.toFixed(2)},${target.z.toFixed(2)})` : ""
			onUpdate(`pos:(${pos.x.toFixed(2)},${pos.y.toFixed(2)},${pos.z.toFixed(2)}) ${targetStr}`)
			lastLog.current = now
		}
	})

	return null
}

export interface AvatarSceneProps {
	modelUrl?: string
	width?: number
	height?: number
	state?: AvatarState
	enableControls?: boolean
}

export function AvatarScene({
	modelUrl,
	width = 300,
	height = 400,
	state = "idle",
	enableControls = true,
}: AvatarSceneProps) {
	const { vrm, isLoading, error, progress, loadVRM, dispose } = useVRMLoader()
	const [cameraPos, setCameraPos] = useState("")
	const [resetKey, setResetKey] = useState(0)
	const controlsRef = useRef<OrbitControlsImpl | null>(null)

	const loadVRMRef = useRef(loadVRM)
	loadVRMRef.current = loadVRM

	useEffect(() => {
		if (modelUrl) {
			loadVRMRef.current(modelUrl)
		}
	}, [modelUrl])

	return (
		<div style={{ width, height, backgroundImage: `url(${welcomeBg})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
			{/* 디버그 오버레이 */}
			<div style={{ position: "absolute", top: 4, left: 4, color: "white", fontSize: 9, zIndex: 10, background: "rgba(0,0,0,0.6)", padding: "2px 4px", borderRadius: 3 }}>
				<div style={{ display: "flex", gap: 6, alignItems: "center" }}>
					{isLoading && `로딩 ${progress}%`}
					{error && <span style={{ color: "red" }}>에러</span>}
					{vrm && <span style={{ color: "lime" }}>OK</span>}
					<button
						type="button"
						onClick={() => {
							dispose()
							setResetKey(k => k + 1)
							if (modelUrl) loadVRMRef.current(modelUrl)
						}}
						style={{ background: "#333", border: "1px solid #555", color: "white", padding: "0 4px", cursor: "pointer", fontSize: 9 }}
					>
						↻
					</button>
				</div>
				<div style={{ color: "#aaa", marginTop: 2 }}>{cameraPos}</div>
			</div>
			<Canvas
				key={resetKey}
				camera={{ position: [0, 1.5, 0.7], fov: 35 }}
				style={{ width: "100%", height: "100%" }}
				gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
				frameloop="always"
			>
				<ambientLight intensity={0.8} />
				<directionalLight position={[2, 2, 2]} intensity={1} />
				{enableControls && <OrbitControls ref={controlsRef} target={[0, 1.4, 0]} />}
				<CameraLogger onUpdate={setCameraPos} controlsRef={controlsRef} />
				{vrm && <VRMAvatar vrm={vrm} state={state} />}
			</Canvas>
		</div>
	)
}
