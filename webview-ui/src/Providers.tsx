import { type ReactNode } from "react"

import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { ClineAuthProvider } from "./context/ClineAuthContext"
import { CaretStateContextProvider } from "./caret/context/CaretStateContext"
import { CaretI18nProvider } from "./caret/context/CaretI18nContext"
import { HeroUIProvider } from "@heroui/react"
import { CustomPostHogProvider } from "./CustomPostHogProvider"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ExtensionStateContextProvider>
			<CaretStateContextProvider>
				<CaretI18nProvider>
					<CustomPostHogProvider>
						<ClineAuthProvider>
							<HeroUIProvider>{children}</HeroUIProvider>
						</ClineAuthProvider>
					</CustomPostHogProvider>
				</CaretI18nProvider>
			</CaretStateContextProvider>
		</ExtensionStateContextProvider>
	)
}
