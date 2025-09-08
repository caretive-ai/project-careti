export interface IPromptSystem {
    getPrompt(context: any): Promise<string>;
}
