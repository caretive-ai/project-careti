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
        const adapter = this.adapters.get(context.modeSystem);
        if (!adapter) {
            throw new Error(`Unsupported mode system: ${context.modeSystem}`);
        }
        // We cast the context to the specific type expected by the adapters.
        // This is safe because our SystemManagerContext is a superset.
        return adapter.getPrompt(context as CaretSystemPromptContext);
    }
}
