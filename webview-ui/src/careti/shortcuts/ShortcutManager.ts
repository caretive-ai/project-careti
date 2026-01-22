import shortcuts from "./shortcuts.json"

type ShortcutId = keyof typeof shortcuts

class ShortcutManager {
	getKeys(id: ShortcutId): string[] {
		return shortcuts[id]?.keys ?? []
	}

	getLabel(id: ShortcutId): string {
		return shortcuts[id]?.label ?? ""
	}
}

export const shortcutManager = new ShortcutManager()
export type { ShortcutId }
