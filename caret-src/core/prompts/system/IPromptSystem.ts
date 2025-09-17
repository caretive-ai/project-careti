import { CaretSystemPromptContext } from "./types";

export interface IPromptSystem {
    getPrompt(context: CaretSystemPromptContext): Promise<string>;
}
