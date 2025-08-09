import { SVGProps } from "react"

/**
 * ClineLogoVariable component renders the Caret logo with automatic theme adaptation.
 *
 * This component uses window.caretBanner and applies CSS filters to automatically
 * adjust colors based on the active VS Code theme (light, dark, high contrast)
 * to ensure optimal contrast with the background.
 *
 * @param {SVGProps<SVGSVGElement>} props - Standard SVG props including className, style, etc.
 * @returns {JSX.Element} Caret logo that adapts to VS Code themes
 */
const ClineLogoVariable = (props: SVGProps<SVGSVGElement> & { className?: string }) => {
	// CARET MODIFICATION: window.caretBanner 사용
	const caretBanner = (window as any).caretBanner || ""
	
	return (
		<img 
			src={caretBanner} 
			alt="Caret Logo" 
			className={props.className}
			style={{
				width: props.width || "47px",
				height: props.height || "50px",
				// VSCode 테마에 맞춰 색상이 변경되도록 filter 적용
				filter: "brightness(0) saturate(100%) invert(var(--vscode-icon-foreground-brightness, 0.8))",
				...props.style
			}}
		/>
	)
}

export default ClineLogoVariable
