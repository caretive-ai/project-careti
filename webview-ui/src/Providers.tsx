import { HeroUIProvider } from "@heroui/react"
import { type ReactNode } from "react"
import { CustomPostHogProvider } from "./CustomPostHogProvider"
import { CaretStateContextProvider } from "./caret/context/CaretStateContext"
import { ClineAuthProvider } from "./context/ClineAuthContext"
import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ExtensionStateContextProvider>
			<CaretStateContextProvider>
				<CustomPostHogProvider>
					<ClineAuthProvider>
						<HeroUIProvider>{children}</HeroUIProvider>
					</ClineAuthProvider>
				</CustomPostHogProvider>
			</CaretStateContextProvider>
		</ExtensionStateContextProvider>
	)
}
