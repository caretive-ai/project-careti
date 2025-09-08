import { Logger } from "@/services/logging/Logger";
import { IPromptSystem } from "./IPromptSystem";
import { CaretJsonAdapter } from "./adapters/CaretJsonAdapter";
import { ClineLatestAdapter } from "./adapters/ClineLatestAdapter";
import { CaretSystemPromptContext } from "./types";

// Define a context type that includes the system selector and is compatible with Caret's context.
type SystemManagerContext = { modeSystem: 'caret' | 'cline' } & Partial<CaretSystemPromptContext>;

export class PromptSystemManager {
    private adapters: Map<string, IPromptSystem>;

    constructor() {
        this.adapters = new Map();
        this.adapters.set("caret", new CaretJsonAdapter());
        this.adapters.set("cline", new ClineLatestAdapter());
    }

    public getPrompt(context: SystemManagerContext): Promise<string> {
        const adapterKey = context.modeSystem;
        const adapter = this.adapters.get(adapterKey);
        if (!adapter) {
            Logger.error(`[PromptSystemManager] Unsupported mode system: ${adapterKey}`);
            throw new Error(`Unsupported mode system: ${adapterKey}`);
        }
        Logger.debug(`[PromptSystemManager] Using adapter: ${adapterKey}`);
        // We cast the context to the specific type expected by the adapters.
        // This is safe because our SystemManagerContext is a superset.
        return adapter.getPrompt(context as CaretSystemPromptContext);
    }
}
