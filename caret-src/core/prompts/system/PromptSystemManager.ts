import { IPromptSystem } from "./IPromptSystem";
import { CaretJsonAdapter } from "./adapters/CaretJsonAdapter";
import { ClineLatestAdapter } from "./adapters/ClineLatestAdapter";

export class PromptSystemManager {
    private adapters: Map<string, IPromptSystem>;

    constructor() {
        this.adapters = new Map();
        this.adapters.set("caret", new CaretJsonAdapter());
        this.adapters.set("cline", new ClineLatestAdapter());
    }

    public getPrompt(context: { modeSystem: 'caret' | 'cline' }): Promise<string> {
        const adapter = this.adapters.get(context.modeSystem);
        if (!adapter) {
            throw new Error(`Unsupported mode system: ${context.modeSystem}`);
        }
        return adapter.getPrompt(context);
    }
}
