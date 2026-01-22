// CARETI MODIFICATION: Standalone에서 리소스 로딩을 위해 cwd를 설치 디렉토리로 고정 (테스트 가능하도록 분리)

export function setStandaloneInstallDirCwd(installDir: string): string {
	process.chdir(installDir)
	return process.cwd()
}
