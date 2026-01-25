// CARETI MODIFICATION: Web search tool using SerpAPI
import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import type { ClineToolSpec } from "../spec"
import { TASK_PROGRESS_PARAMETER } from "../types"

/**
 * ## web_search
 * Description: Search the web using SerpAPI to find current information, documentation, or answers.
 * Parameters:
 * - query: (required) The search query string
 * - num_results: (optional) Number of results to return (default: 5, max: 10)
 * Usage:
 * <web_search>
 * <query>Your search query here</query>
 * <num_results>5</num_results>
 * </web_search>
 */

const id = ClineDefaultTool.WEB_SEARCH

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "web_search",
	description: `Search the web for current information, documentation, articles, or answers to questions.
- Returns a list of search results with titles, URLs, and snippets
- Use this when you need up-to-date information that may not be in your training data
- Useful for finding documentation, API references, error solutions, and current best practices`,
	parameters: [
		{
			name: "query",
			required: true,
			instruction: "The search query string. Be specific to get better results.",
			usage: "Your search query here",
		},
		{
			name: "num_results",
			required: false,
			instruction: "Number of results to return (default: 5, max: 10)",
			usage: "5",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const nextGen: ClineToolSpec = {
	variant: ModelFamily.NEXT_GEN,
	id,
	name: "web_search",
	description: `Search the web for current information using SerpAPI.
- Returns search results with titles, URLs, and snippets
- Use for up-to-date documentation, API references, or current information`,
	parameters: [
		{
			name: "query",
			required: true,
			instruction: "The search query string",
			usage: "react hooks documentation",
		},
		{
			name: "num_results",
			required: false,
			instruction: "Number of results (default: 5, max: 10)",
			usage: "5",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	variant: ModelFamily.NATIVE_NEXT_GEN,
	id,
	name: "web_search",
	description: "Search the web for current information, documentation, or answers.",
	parameters: [
		{
			name: "query",
			required: true,
			instruction: "The search query string",
		},
		{
			name: "num_results",
			required: false,
			instruction: "Number of results (default: 5, max: 10)",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	...NATIVE_NEXT_GEN,
	variant: ModelFamily.NATIVE_GPT_5,
}

export const web_search_variants = [generic, nextGen, NATIVE_GPT_5, NATIVE_NEXT_GEN]
