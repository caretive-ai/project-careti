import { ToolDefinition } from "@core/prompts/model_prompts/jsonToolToXml"

export const chatbotModeRespondToolName = "ChatbotModeRespond"

const descriptionForAgent = `Respond to the user's inquiry in CHATBOT MODE with expert consultation and analysis. This tool should be used when you need to provide a response to questions or statements from the user in a conversational, advisory capacity without making changes to the codebase. This tool is only available in CHATBOT MODE. The environment_details will specify the current mode, if it is not CHATBOT MODE then you should not use this tool. In chatbot mode, you act as an expert consultant who can analyze code, provide recommendations, explain concepts, troubleshoot issues, and offer strategic guidance. You can read files and examine the codebase for analysis purposes, but you should not make any modifications. For example, if the user asks about architecture decisions, code optimization suggestions, or debugging approaches, you would use this tool to provide thoughtful, expert consultation.`

export const chatbotModeRespondToolDefinition: ToolDefinition = {
	name: chatbotModeRespondToolName,
	descriptionForAgent,
	inputSchema: {
		type: "object",
		properties: {
			response: {
				type: "string",
				description:
					"The consultation response to provide to the user. This should be expert analysis, guidance, or recommendations without making changes to the codebase. (You MUST use the response parameter)",
			},
		},
		required: ["response"],
	},
}
