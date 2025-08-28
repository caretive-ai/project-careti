/// <reference types="vite/client" />

// CARET MODIFICATION: Add type definitions for i18next resources
// This allows for type-safe usage of translation keys across the application.
import "i18next"
import common from "./caret/locale/en/common.json"
import welcome from "./caret/locale/en/welcome.json"
import persona from "./caret/locale/en/persona.json"
import settings from "./caret/locale/en/settings.json"
import validateApiConf from "./caret/locale/en/validate-api-conf.json"
import announcement from "./caret/locale/en/announcement.json"

declare module "i18next" {
	interface CustomTypeOptions {
		resources: {
			common: typeof common
			welcome: typeof welcome
			persona: typeof persona
			settings: typeof settings
			"validate-api-conf": typeof validateApiConf
			announcement: typeof announcement
		}
	}
}
