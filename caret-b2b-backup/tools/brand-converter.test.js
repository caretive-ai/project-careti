#!/usr/bin/env node

/**
 * Unified Brand Converter Test Suite
 * TDD 테스트 for cline ↔ caret, caret ↔ codecenter
 * 
 * @author Luke Yang + Claude Code
 * @version 1.0.0
 */

const fs = require('fs')
const path = require('path')
const BrandConverter = require('./brand-converter')

class BrandConverterTest {
    constructor() {
        this.testCount = 0
        this.passedTests = 0
        this.failedTests = 0
        this.projectRoot = process.cwd()
        this.originalPackageJson = null
    }

    /**
     * 테스트 실행 전 setup
     */
    async setup() {
        console.log('🔧 테스트 환경 설정...')
        
        // 원본 package.json 백업
        const packageJsonPath = path.join(this.projectRoot, 'package.json')
        if (fs.existsSync(packageJsonPath)) {
            this.originalPackageJson = fs.readFileSync(packageJsonPath, 'utf8')
        }
        
        // 테스트용 백업 디렉토리 생성
        const testBackupsDir = path.join(this.projectRoot, 'caret-b2b', 'test-backups')
        if (!fs.existsSync(testBackupsDir)) {
            fs.mkdirSync(testBackupsDir, { recursive: true })
        }
    }

    /**
     * 테스트 실행 후 cleanup
     */
    async cleanup() {
        console.log('🧹 테스트 환경 정리...')
        
        // 원본 package.json 복원
        if (this.originalPackageJson) {
            const packageJsonPath = path.join(this.projectRoot, 'package.json')
            fs.writeFileSync(packageJsonPath, this.originalPackageJson)
        }
    }

    /**
     * 테스트 실행 헬퍼
     */
    async test(description, testFn) {
        this.testCount++
        process.stdout.write(`${this.testCount}. ${description}... `)
        
        try {
            await testFn()
            console.log('✅ PASS')
            this.passedTests++
        } catch (error) {
            console.log(`❌ FAIL: ${error.message}`)
            this.failedTests++
        }
    }

    /**
     * assertion 헬퍼
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message)
        }
    }

    /**
     * 테스트 1: 브랜드 자동 감지 테스트
     */
    async testBrandDetection() {
        const converter = new BrandConverter()
        
        // Caret 브랜드 테스트
        const packageJsonPath = path.join(this.projectRoot, 'package.json')
        const originalContent = fs.readFileSync(packageJsonPath, 'utf8')
        const packageJson = JSON.parse(originalContent)
        
        // Caret으로 설정
        packageJson.displayName = 'Caret'
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
        
        const detectedBrand = converter.detectCurrentBrand()
        this.assert(detectedBrand === 'caret', `Expected 'caret', got '${detectedBrand}'`)
        
        // 원복
        fs.writeFileSync(packageJsonPath, originalContent)
    }

    /**
     * 테스트 2: 브랜드 설정 로드 테스트
     */
    async testBrandConfigLoading() {
        const converter = new BrandConverter()
        
        // caret 브랜드 설정 로드
        const caretConfig = converter.loadBrandConfig('caret')
        this.assert(caretConfig !== null, 'Caret config should be loaded')
        this.assert(caretConfig.metadata.brand === 'caret', 'Config should have correct brand')
        this.assert(caretConfig.brand_mappings.package_json, 'Config should have package_json mappings')
        
        // codecenter 브랜드 설정 로드
        const codecenterConfig = converter.loadBrandConfig('codecenter')
        this.assert(codecenterConfig !== null, 'CodeCenter config should be loaded')
        this.assert(codecenterConfig.metadata.brand === 'codecenter', 'Config should have correct brand')
    }

    /**
     * 테스트 3: package.json 텍스트 변환 테스트
     */
    async testTextConversion() {
        const converter = new BrandConverter()
        converter.isDryRun = true // 실제 변경하지 않음
        
        const config = converter.loadBrandConfig('caret')
        this.assert(config !== null, 'Config should be loaded for text conversion test')
        
        // 텍스트 변환 시뮬레이션 테스트
        const mappings = config.brand_mappings.package_json
        this.assert(mappings['claude-dev'] === 'caret', 'Mapping should convert claude-dev to caret')
        this.assert(mappings['Cline'] === 'Caret', 'Mapping should convert Cline to Caret')
    }

    /**
     * 테스트 4: 이미지 파일 존재 확인
     */
    async testImageAssetsExist() {
        const brands = ['cline', 'caret', 'codecenter']
        
        for (const brand of brands) {
            const assetsPath = path.join(this.projectRoot, 'caret-b2b', 'brands', brand, 'assets', 'icons')
            this.assert(fs.existsSync(assetsPath), `Assets directory should exist for ${brand}`)
            
            const files = fs.readdirSync(assetsPath)
            this.assert(files.length > 0, `Assets directory should contain files for ${brand}`)
        }
    }

    /**
     * 테스트 5: 백업 시스템 테스트
     */
    async testBackupSystem() {
        const backupsDir = path.join(this.projectRoot, 'caret-b2b', 'backups')
        this.assert(fs.existsSync(backupsDir), 'Backups directory should exist')
        
        // 백업 디렉토리가 쓰기 가능한지 확인
        const testFile = path.join(backupsDir, 'test-write-permission')
        fs.writeFileSync(testFile, 'test')
        this.assert(fs.existsSync(testFile), 'Should be able to write to backups directory')
        fs.unlinkSync(testFile)
    }

    /**
     * 테스트 6: 터미널 브랜딩 아이콘 확인
     */
    async testTerminalIcons() {
        // Caret 터미널 아이콘
        const caretIcon = path.join(this.projectRoot, 'caret-b2b', 'brands', 'caret', 'assets', 'icons', 'caret_shell_icon.svg')
        this.assert(fs.existsSync(caretIcon), 'Caret terminal icon should exist')
        
        // CodeCenter 터미널 아이콘
        const codecenterIcon = path.join(this.projectRoot, 'caret-b2b', 'brands', 'codecenter', 'assets', 'icons', 'codecenter_shell_icon.svg')
        this.assert(fs.existsSync(codecenterIcon), 'CodeCenter terminal icon should exist')
    }

    /**
     * 테스트 7: 전체 변환 프로세스 시뮬레이션 (DRY-RUN)
     */
    async testFullConversionDryRun() {
        const converter = new BrandConverter()
        converter.isDryRun = true
        
        // 현재 브랜드 감지
        const currentBrand = converter.detectCurrentBrand()
        this.assert(currentBrand, 'Should detect current brand')
        
        // 다른 브랜드로 변환 시뮬레이션
        const targetBrand = currentBrand === 'caret' ? 'cline' : 'caret'
        const config = converter.loadBrandConfig(currentBrand)
        
        this.assert(config !== null, `Should load config for ${currentBrand}`)
        
        // 텍스트 변환 테스트 (DRY-RUN)
        const textConverted = await converter.convertText(currentBrand, targetBrand, config)
        // DRY-RUN이므로 실제 변환은 안되지만 로직은 실행됨
    }

    /**
     * 통합 테스트 스위트 실행
     */
    async runAllTests() {
        console.log('🚀 Unified Brand Converter Test Suite 시작\n')
        
        await this.setup()
        
        try {
            await this.test('브랜드 자동 감지', () => this.testBrandDetection())
            await this.test('브랜드 설정 로드', () => this.testBrandConfigLoading())
            await this.test('텍스트 변환 로직', () => this.testTextConversion())
            await this.test('이미지 파일 존재 확인', () => this.testImageAssetsExist())
            await this.test('백업 시스템', () => this.testBackupSystem())
            await this.test('터미널 아이콘 확인', () => this.testTerminalIcons())
            await this.test('전체 변환 프로세스 (DRY-RUN)', () => this.testFullConversionDryRun())
        } finally {
            await this.cleanup()
        }
        
        // 결과 출력
        console.log('\n📊 테스트 결과:')
        console.log(`   총 테스트: ${this.testCount}개`)
        console.log(`   통과: ${this.passedTests}개 ✅`)
        console.log(`   실패: ${this.failedTests}개 ❌`)
        console.log(`   성공률: ${((this.passedTests / this.testCount) * 100).toFixed(1)}%`)
        
        if (this.failedTests === 0) {
            console.log('\n🎉 모든 테스트 통과! 통합 브랜드 시스템이 준비되었습니다.')
            return true
        } else {
            console.log('\n⚠️ 일부 테스트가 실패했습니다. 문제를 해결한 후 다시 실행해주세요.')
            return false
        }
    }
}

// 스크립트 실행
if (require.main === module) {
    const tester = new BrandConverterTest()
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1)
    }).catch(error => {
        console.error('❌ 테스트 실행 오류:', error)
        process.exit(1)
    })
}

module.exports = BrandConverterTest