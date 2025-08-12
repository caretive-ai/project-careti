import { useState, useEffect } from "react"

export const useResponsive = () => {
	const [width, setWidth] = useState(window.innerWidth)

	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth)
		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	return {
		isSmallScreen: width < 640,
		isMediumScreen: width >= 640 && width < 1024,
		isLargeScreen: width >= 1024,
	}
}
