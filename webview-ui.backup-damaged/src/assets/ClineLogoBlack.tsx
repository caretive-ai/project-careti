import { SVGProps } from "react"

const ClineLogoBlack = (props: SVGProps<SVGSVGElement> & { className?: string }) => {
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
				filter: "brightness(0) saturate(100%)", // 검은색으로 변환
				...props.style
			}}
		/>
	)
}

export default ClineLogoBlack
