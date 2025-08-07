import { type ReactNode } from "react"

import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
<<<<<<< HEAD
=======
import { ClineAuthProvider } from "./context/ClineAuthContext"
>>>>>>> upstream/main
import { HeroUIProvider } from "@heroui/react"
import { CustomPostHogProvider } from "./CustomPostHogProvider"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ExtensionStateContextProvider>
			<CustomPostHogProvider>
<<<<<<< HEAD
				<HeroUIProvider>{children}</HeroUIProvider>
=======
				<ClineAuthProvider>
					<HeroUIProvider>{children}</HeroUIProvider>
				</ClineAuthProvider>
>>>>>>> upstream/main
			</CustomPostHogProvider>
		</ExtensionStateContextProvider>
	)
}
