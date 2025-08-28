import { GoogleGenAI } from "@google/genai"
import dotenv from "dotenv"
import fs from "fs/promises"
import path from "path"

// .env 파일에서 환경 변수 로드
dotenv.config()

// API 키 가져오기
const apiKey = process.env.GOOGLE_API_KEY
if (!apiKey) {
	console.error("오류: GOOGLE_API_KEY를 .env 파일에 설정해주세요.")
	process.exit(1)
}

// API 클라이언트 초기화
const genAI = new GoogleGenAI({ apiKey })
// 마스터께서 알려주신 모델명 사용
const modelName = "gemini-2.5-flash-preview-05-20"

async function calculateTokens(filePath) {
	try {
		const absolutePath = path.resolve(process.cwd(), filePath)
		try {
			await fs.access(absolutePath)
		} catch {
			console.error(`오류: 파일을 찾을 수 없습니다 - ${absolutePath}`)
			return
		}

		const fileContent = await fs.readFile(absolutePath, "utf-8")

		// 올바른 API 호출 방식으로 수정
		const { totalTokens } = await genAI.models.countTokens({
			model: modelName,
			contents: [{ parts: [{ text: fileContent }] }],
		})

		console.log(`파일: ${filePath}`)
		console.log(`모델: ${modelName}`)
		console.log(`총 토큰 수: ${totalTokens}`)
	} catch (error) {
		console.error(`오류: 토큰 수를 계산하는 중 문제가 발생했습니다.`, error)
	}
}

// 명령줄 인자 처리
const filePathArg = process.argv[2]
if (!filePathArg) {
	console.error("사용법: node caret-scripts/calculate-gemini-tokens.mjs <파일_경로>")
	console.error("예시: node caret-scripts/calculate-gemini-tokens.mjs README.md")
	process.exit(1)
}

calculateTokens(filePathArg)
