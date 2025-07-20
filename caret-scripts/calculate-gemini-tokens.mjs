import * as GenAI from "@google/genai";
const { GoogleGenerativeAI } = GenAI;
import fs from "fs";
import path from "path";

async function calculateGeminiTokens(filePath) {
    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
        console.error(`오류: 파일을 찾을 수 없습니다 - ${filePath}`);
        process.exit(1);
    }

    // 파일 내용 읽기
    let fileContent;
    try {
        fileContent = fs.readFileSync(filePath, "utf-8");
    } catch (error) {
        console.error(`오류: 파일을 읽는 중 문제가 발생했습니다 - ${filePath}`, error);
        process.exit(1);
    }

    // Gemini API 키 환경 변수 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("오류: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
        console.error("스크립트를 실행하기 전에 'set GEMINI_API_KEY=YOUR_API_KEY' (Windows) 또는 'export GEMINI_API_KEY=YOUR_API_KEY' (Linux/macOS)를 실행해주세요.");
        process.exit(1);
    }

    // GoogleGenerativeAI 인스턴스 생성
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // 또는 "gemini-1.5-pro-latest" 등 원하는 모델 사용

    try {
        // 토큰 수 계산
        const { totalTokens } = await model.countTokens(fileContent);
        console.log(`파일: ${filePath}`);
        console.log(`총 토큰 수: ${totalTokens}`);
    } catch (error) {
        console.error(`오류: Gemini API로 토큰 수를 계산하는 중 문제가 발생했습니다.`, error);
        console.error(`API 응답 오류일 수 있습니다. API 키가 유효한지, 네트워크 연결이 원활한지 확인해주세요.`);
        process.exit(1);
    }
}

// 명령줄 인자 처리
const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error("사용법: node calculate-gemini-tokens.mjs <파일_경로>");
    console.error("예시: node calculate-gemini-tokens.mjs ../caret-docs/README.md");
    process.exit(1);
}

const filePath = path.resolve(process.cwd(), args[0]); // 현재 작업 디렉토리 기준으로 경로 해결
calculateGeminiTokens(filePath);
