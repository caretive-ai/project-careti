#!/usr/bin/env node

/**
 * Unified Brand Converter
 * 통합 브랜딩 변환 시스템 - cline ↔ caret, caret ↔ codecenter
 * 
 * Usage:
 * node brand-converter.js cline
 * node brand-converter.js caret  
 * node brand-converter.js codecenter
 * node brand-converter.js --status
 * node brand-converter.js cline --no-build
 * node brand-converter.js caret --dry-run
 * 
 * @author Luke Yang + Claude Code
 * @version 1.0.0
 */

const fs = require('fs')
const path = require('path')

class BrandConverter {
    constructor() {
        this.isDryRun = false
        this.currentBrand = null
        this.projectRoot = process.cwd()
        this.brandsDir = path.join(this.projectRoot, 'caret-b2b', 'brands')
    }

    /**
     * 현재 브랜드 자동 감지 (동적 브랜드 발견)
     */
    detectCurrentBrand() {
        try {
            const packageJsonPath = path.join(this.projectRoot, 'package.json')
            if (!fs.existsSync(packageJsonPath)) {
                this.error('❌ package.json을 찾을 수 없습니다')
                return null
            }

            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
            const displayName = (packageJson.displayName || '').toLowerCase()
            
            // brands 폴더를 스캔해서 동적으로 브랜드 감지
            const availableBrands = this.getAvailableBrands()
            for (const brand of availableBrands) {
                if (displayName.includes(brand.toLowerCase())) {
                    return brand
                }
            }
            
            // 기본값: 감지 실패
            throw new Error('브랜드를 감지할 수 없습니다. package.json의 displayName을 확인하세요.')
        } catch (error) {
            this.error(`❌ 브랜드 감지 실패: ${error.message}`)
            throw error
        }
    }

    /**
     * 사용 가능한 브랜드 목록을 동적으로 가져오기 (brands 폴더 스캔)
     */
    getAvailableBrands() {
        if (!fs.existsSync(this.brandsDir)) {
            return []
        }
        
        const brandDirs = fs.readdirSync(this.brandsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            
        return brandDirs
    }

    /**
     * CHANGELOG 파일에서 최신 버전 추출
     */
    getVersionFromChangelog(brand) {
        let changelogPath
        
        // 모든 브랜드는 config에서 changelog_file 경로 가져오기
        const configPath = path.join(this.brandsDir, brand, 'brand-config.json')
        if (!fs.existsSync(configPath)) {
            return null
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
            const changelogFile = config.changelog_file || `CHANGELOG-${brand.toUpperCase()}.md`
            
            // 경로가 이미 완전한지 확인 (슬래시 포함 여부)
            if (changelogFile.includes('/') || changelogFile.includes('\\')) {
                changelogPath = path.resolve(this.projectRoot, changelogFile)
            } else {
                // 파일 이름만 있는 경우, 해당 브랜드 폴더 내부를 기준으로 경로 설정
                changelogPath = path.join(this.brandsDir, brand, changelogFile)
            }
        } catch (error) {
            this.error(`❌ ${brand}의 brand-config.json 읽기 실패: ${error.message}`)
            return null
        }
        
        if (!fs.existsSync(changelogPath)) {
            this.warn(`  ⚠️  CHANGELOG 파일을 찾을 수 없습니다: ${changelogPath}`)
            return null
        }
        
        try {
            const content = fs.readFileSync(changelogPath, 'utf8')
            const versionMatch = content.match(/##\s*\[([^\]]+)\]/)
            return versionMatch ? versionMatch[1] : null
        } catch (error) {
            return null
        }
    }

    /**
     * 브랜드 설정 로드 (버전 정보 동적 추가)
     */
    loadBrandConfig(brand) {       
        const configPath = path.join(this.brandsDir, brand, 'brand-config.json')
        
        if (!fs.existsSync(configPath)) {
            this.error(`❌ 브랜드 설정을 찾을 수 없습니다: ${configPath}`)
            return null
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
            
            // 동적 버전 매핑 추가 (항상 target -> brand 방향)
            const brandInConfig = config.metadata?.brand
            const targetInConfig = config.metadata?.target

            if (brandInConfig && targetInConfig) {
                const brandVersion = this.getVersionFromChangelog(brandInConfig)
                const targetVersion = this.getVersionFromChangelog(targetInConfig)
                
                if (brandVersion && targetVersion && brandVersion !== targetVersion) {
                    if (!config.brand_mappings.package_json) {
                        config.brand_mappings.package_json = {}
                    }
                    // 매핑은 항상 target -> brand 방향으로 정의되어야 함
                    config.brand_mappings.package_json[targetVersion] = brandVersion
                    if (!this.isDryRun) {
                        this.log(`  📋 동적 버전 매핑 추가: ${targetVersion} ↔ ${brandVersion}`)
                    }
                }
            }
            
            return config
        } catch (error) {
            this.error(`❌ 브랜드 설정 로드 실패: ${error.message}`)
            return null
        }
    }

    /**
     * 매핑 검증기 - 중첩, 순환참조, 빈 값 등 검증
     */
    validateMappings(sortedMappings) {
        const result = {
            isValid: true,
            critical: false,
            errors: [],
            warnings: [],
            overlaps: []
        }

        // 1. 중첩 매핑 검증 (긴 매핑에 짧은 매핑이 포함되는지)
        for (let i = 0; i < sortedMappings.length; i++) {
            for (let j = i + 1; j < sortedMappings.length; j++) {
                const [longerKey] = sortedMappings[i]
                const [shorterKey] = sortedMappings[j]
                if (longerKey.includes(shorterKey)) {
                    result.overlaps.push(`"${shorterKey}" ⊆ "${longerKey}"`)
                }
            }
        }

        // 2. 빈 값 검증
        for (const [from, to] of sortedMappings) {
            if (!from || !to) {
                result.errors.push(`빈 매핑 값: "${from}" → "${to}"`)
                result.isValid = false
                result.critical = true
            }
        }

        // 3. 자기 자신으로의 매핑 검증
        for (const [from, to] of sortedMappings) {
            if (from === to) {
                result.warnings.push(`자기 자신으로 매핑: "${from}" → "${to}"`)
                result.isValid = false
            }
        }

        // 4. 순환참조 검증 (A→B, B→A)
        const mappingMap = new Map(sortedMappings)
        for (const [from, to] of sortedMappings) {
            if (mappingMap.has(to) && mappingMap.get(to) === from) {
                result.errors.push(`순환참조 감지: "${from}" ↔ "${to}"`)
                result.isValid = false
                result.critical = true
            }
        }

        // 5. URL 형식 검증
        for (const [from, to] of sortedMappings) {
            if (from.startsWith('http') && !to.startsWith('http')) {
                result.errors.push(`URL 형식 불일치: "${from}" → "${to}"`)
                result.isValid = false
                result.critical = true
            }
        }

        return result
    }

    /**
     * 텍스트 매핑 변환 (package.json)
     */
    async convertText(fromBrand, toBrand, config) {
        const packageJsonPath = path.join(this.projectRoot, 'package.json')
        
        if (!fs.existsSync(packageJsonPath)) {
            this.error('❌ package.json을 찾을 수 없습니다')
            return false
        }


        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        const mappings = config.brand_mappings?.package_json || config.brand_mappings?.pairs || config.mappings || {}
        let changeCount = 0

        // Config의 package_fields를 whitelist로 사용
        const allowedFields = config.package_fields || ['displayName', 'description', 'name', 'author.name', 'publisher', 'repository.url', 'homepage']
        
        // 역방향 매핑 생성 (cline → caret 변환을 위해)
        const reverseMappings = {}
        for (const [key, value] of Object.entries(mappings)) {
            reverseMappings[value] = key
        }
        
        // 현재 브랜드에서 다른 브랜드로 변환할 때 적절한 매핑 선택
        let effectiveMappings = mappings
        const configTarget = config.metadata?.target
        
        // 설정 파일의 target과 실제 변환 방향을 비교하여 매핑 방향 결정
        // 매핑은 config.metadata.target → config.metadata.brand 방향으로 정의됨
        if (configTarget === fromBrand && toBrand === config.metadata.brand) {
            // 설정과 동일한 방향 (target → brand): 정방향 매핑 사용
            effectiveMappings = mappings
            if (!this.isDryRun) this.log(`  📋 Using forward mappings (${fromBrand} → ${toBrand})`)
        } else if (configTarget === toBrand && fromBrand === config.metadata.brand) {
            // 설정과 반대 방향 (brand → target): 역방향 매핑 사용
            effectiveMappings = reverseMappings
            if (!this.isDryRun) this.log(`  📋 Using reverse mappings (${fromBrand} → ${toBrand})`)
        } else {
            // 기본값: 정방향 매핑 사용
            effectiveMappings = mappings
            if (!this.isDryRun) this.log(`  📋 Using forward mappings (${fromBrand} → ${toBrand}) [default]`)
        }
        
        // 매핑을 길이 역순으로 정렬 (긴 문자열부터 적용하여 중첩 문제 방지)
        const sortedMappings = Object.entries(effectiveMappings).sort((a, b) => b[0].length - a[0].length)
        
        // 매핑 검증기 - 중첩 문제와 변환 결과 검증
        const validationResult = this.validateMappings(sortedMappings)
        
        if (!validationResult.isValid) {
            this.error(`❌ 매핑 검증 실패:`)
            validationResult.errors.forEach(error => this.error(`  - ${error}`))
            if (validationResult.critical) {
                this.error(`🚫 심각한 문제로 변환을 중단합니다`)
                return false
            }
            this.log(`⚠️  경고가 있지만 변환을 계속합니다`)
        }
        
        if (validationResult.overlaps.length > 0) {
            if (!this.isDryRun) {
                this.log(`⚠️  매핑 중첩 감지: ${validationResult.overlaps.join(', ')} - 길이순 정렬로 해결`)
            }
        }
        
        // 디버그: 매핑 내용 확인
        if (this.isDryRun && sortedMappings.length > 0) {
            console.log(`  📋 매핑 샘플 (길이순): ${sortedMappings.slice(0,3).map(([from, to]) => `${from} → ${to}`).join(', ')}`)
            if (validationResult.overlaps.length > 0) {
                console.log(`  ⚠️  중첩된 매핑: ${validationResult.overlaps.join(', ')}`)
            }
        }
        
        for (const field of allowedFields) {
            const value = this.getNestedValue(packageJson, field)
            if (value && typeof value === 'string') {
                let newValue = value
                let fieldChanged = false
                
                // 각 필드에 대해 첫 번째 매칭되는 매핑만 적용 (길이순으로 정렬되어 있으므로 가장 구체적인 것 우선)
                for (const [from, to] of sortedMappings) {
                    if (!fieldChanged && newValue.includes(from)) {
                        newValue = newValue.replace(new RegExp(from, 'g'), to)
                        this.setNestedValue(packageJson, field, newValue) // 🔧 FIX: packageJson에 실제로 저장
                        fieldChanged = true
                        changeCount++
                        this.log(`  🔄 ${field}: "${value}" → "${newValue}"`)
                        break // 첫 번째 매핑 적용 후 종료
                    }
                }
            }
        }

        // 변환 후 텍스트 교정 (config 기반)
        const textCorrections = config.post_processing?.text_corrections || {}
        for (const [fromText, toText] of Object.entries(textCorrections)) {
            for (const field of allowedFields) {
                const value = this.getNestedValue(packageJson, field)
                if (value && typeof value === 'string' && value.includes(fromText)) {
                    const correctedValue = value.replace(new RegExp(fromText, 'g'), toText)
                    this.setNestedValue(packageJson, field, correctedValue)
                    this.log(`  🔧 텍스트 교정 [${field}]: "${fromText}" → "${toText}"`)
                    changeCount++
                }
            }
        }

        // Contributes 섹션 처리
        if (packageJson.contributes) {
            // 1. Walkthroughs 처리
            if (packageJson.contributes.walkthroughs) {
                for (const walkthrough of packageJson.contributes.walkthroughs) {
                    // Walkthrough title
                    if (walkthrough.title) {
                        let changed = false
                        for (const [from, to] of sortedMappings) {
                            if (!changed && walkthrough.title.includes(from)) {
                                const originalTitle = walkthrough.title
                                walkthrough.title = walkthrough.title.replace(new RegExp(from, 'g'), to)
                                this.log(`  🔄 Walkthrough title: "${originalTitle}" → "${walkthrough.title}"`)
                                changeCount++
                                changed = true
                                break
                            }
                        }
                    }
                    
                    // Walkthrough steps
                    if (walkthrough.steps) {
                        for (const step of walkthrough.steps) {
                            if (step.title) {
                                let changed = false
                                for (const [from, to] of sortedMappings) {
                                    if (!changed && step.title.includes(from)) {
                                        const originalTitle = step.title
                                        step.title = step.title.replace(new RegExp(from, 'g'), to)
                                        this.log(`  🔄 Step title: "${originalTitle}" → "${step.title}"`)
                                        changeCount++
                                        changed = true
                                        break
                                    }
                                }
                            }
                            if (step.description) {
                                let changed = false
                                for (const [from, to] of sortedMappings) {
                                    if (!changed && step.description.includes(from)) {
                                        const originalDesc = step.description
                                        step.description = step.description.replace(new RegExp(from, 'g'), to)
                                        this.log(`  🔄 Step description: "${originalDesc}" → "${step.description}"`)
                                        changeCount++
                                        changed = true
                                        break
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 2. Commands 처리
            if (packageJson.contributes.commands) {
                for (const command of packageJson.contributes.commands) {
                    // Command title 처리
                    if (command.title) {
                        let changed = false
                        for (const [from, to] of sortedMappings) {
                            if (!changed && command.title.includes(from)) {
                                const originalTitle = command.title
                                command.title = command.title.replace(new RegExp(from, 'g'), to)
                                this.log(`  🔄 Command title: "${originalTitle}" → "${command.title}"`)
                                changeCount++
                                changed = true
                                break
                            }
                        }
                    }
                    
                    // Command category 처리
                    if (command.category) {
                        let changed = false
                        for (const [from, to] of sortedMappings) {
                            if (!changed && command.category.includes(from)) {
                                const originalCategory = command.category
                                command.category = command.category.replace(new RegExp(from, 'g'), to)
                                this.log(`  🔄 Command category: "${originalCategory}" → "${command.category}"`)
                                changeCount++
                                changed = true
                                break
                            }
                        }
                    }
                }
            }

            // 3. Configuration 처리
            if (packageJson.contributes.configuration?.title) {
                let changed = false
                for (const [from, to] of sortedMappings) {
                    if (!changed && packageJson.contributes.configuration.title.includes(from)) {
                        const originalTitle = packageJson.contributes.configuration.title
                        packageJson.contributes.configuration.title = packageJson.contributes.configuration.title.replace(new RegExp(from, 'g'), to)
                        this.log(`  🔄 Configuration title: "${originalTitle}" → "${packageJson.contributes.configuration.title}"`)
                        changeCount++
                        changed = true
                        break
                    }
                }
            }

            // 4. ActivityBar 제목 처리
            if (packageJson.contributes.viewsContainers?.activitybar) {
                for (const container of packageJson.contributes.viewsContainers.activitybar) {
                    if (container.title) {
                        let changed = false
                        for (const [from, to] of sortedMappings) {
                            if (!changed && container.title.includes(from)) {
                                const originalTitle = container.title
                                container.title = container.title.replace(new RegExp(from, 'g'), to)
                                this.log(`  🔄 ActivityBar: "${originalTitle}" → "${container.title}"`)
                                changeCount++
                                changed = true
                                break
                            }
                        }
                    }
                }
            }
        }

        if (!this.isDryRun && changeCount > 0) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
            this.log(`  ✅ ${changeCount}개 필드 변환 완료`)
        }

        return changeCount > 0
    }

    /**
     * 이미지 파일 복사
     */
    async copyAssets(fromBrand, toBrand) {
        const fromAssetsPath = path.join(this.brandsDir, fromBrand, 'assets', 'icons')
        const toAssetsPath = path.join(this.projectRoot, 'assets', 'icons')

        if (!fs.existsSync(fromAssetsPath)) {
            this.error(`❌ 소스 이미지 디렉토리가 없습니다: ${fromAssetsPath}`)
            return false
        }

        if (!fs.existsSync(toAssetsPath)) {
            this.error(`❌ 대상 이미지 디렉토리가 없습니다: ${toAssetsPath}`)
            return false
        }


        // 이미지 파일들 복사
        const files = fs.readdirSync(fromAssetsPath)
        let copiedCount = 0

        for (const file of files) {
            const srcPath = path.join(fromAssetsPath, file)
            const destPath = path.join(toAssetsPath, file)

            if (fs.lstatSync(srcPath).isFile()) {
                if (!this.isDryRun) {
                    fs.copyFileSync(srcPath, destPath)
                }
                this.log(`  🔄 ${file} 복사`)
                copiedCount++
            }
        }

        this.log(`  ✅ ${copiedCount}개 이미지 파일 복사 완료`)
        return true
    }

    /**
     * 규칙 파일 경로 변환 (src/core/storage/disk.ts, src/integrations/terminal/TerminalRegistry.ts 등)
     */
    async convertRulePaths(fromBrand, toBrand, config) {
        // JSON 설정에서 파일 경로 읽기
        const filePaths = config.file_paths || {}
        const filesToProcess = []
        
        // JSON 설정의 file_paths를 기반으로 파일 목록 생성
        for (const [filePath, mappingKey] of Object.entries(filePaths)) {
            const fullPath = path.join(this.projectRoot, filePath)
            const fileName = path.basename(filePath)
            
            filesToProcess.push({
                path: fullPath,
                name: fileName,
                mappingKey: mappingKey
            })
        }

        let processedCount = 0
        
        for (const file of filesToProcess) {
            if (!fs.existsSync(file.path)) {
                this.log(`  ⚠️ ${file.name} 파일이 없어서 스킵합니다: ${file.path}`)
                continue
            }

            // 디버그: 파일 처리 중임을 표시
            if (file.name.includes('Handler')) {
                this.log(`  🔄 백엔드 핸들러 처리: ${file.name}`)
            }

            await this.processRulePathFile(file.path, file.mappingKey, fromBrand, toBrand, config)
            processedCount++
        }

        return processedCount > 0
    }

    /**
     * 개별 파일의 규칙 경로 변환 처리
     */
    async processRulePathFile(filePath, mappingKey, fromBrand, toBrand, config) {
        let content = fs.readFileSync(filePath, 'utf8')
        const originalContent = content
        const fileName = path.basename(filePath)
        
        // JSON 설정에서 해당 mappingKey의 매핑 가져오기
        const mappings = config.brand_mappings?.[mappingKey] || {}
        
        const reverseMappings = {}
        for (const [key, value] of Object.entries(mappings)) {
            reverseMappings[value] = key
        }
        
        let effectiveMappings
        const configBrand = config.metadata?.brand
        const configTarget = config.metadata?.target

        if (configTarget === fromBrand && configBrand === toBrand) {
            // Forward: target -> brand
            effectiveMappings = mappings
        } else if (configBrand === fromBrand && configTarget === toBrand) {
            // Backward: brand -> target
            effectiveMappings = reverseMappings
        } else {
            // Default/fallback
            effectiveMappings = mappings
        }

        let changeCount = 0
        
        // 디버그: 핸들러 파일의 매핑 확인
        if (fileName.includes('Handler')) {
            this.log(`    📋 ${fileName} 매핑: ${Object.keys(effectiveMappings).length}개`)
            for (const [from, to] of Object.entries(effectiveMappings)) {
                this.log(`      - "${from}" → "${to}"`)
            }
        }
        
        // path.join 패턴만 안전하게 변환
        for (const [from, to] of Object.entries(effectiveMappings)) {
            // path.join 내부의 문자열만 대상으로 함
            if (from.startsWith('"') && from.endsWith('"')) {
                const pathJoinPattern = new RegExp(`path\\.join\\([^)]*${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\)`, 'g')
                const matches = content.match(pathJoinPattern)
                if (matches) {
                    for (const match of matches) {
                        const newMatch = match.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to)
                        content = content.replace(match, newMatch)
                        this.log(`  🔄 path.join 패턴: ${from} → ${to}`)
                        changeCount++
                    }
                }
            } else {
                // 기존 방식 (단순 문자열 치환)
                const fromPattern = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
                if (content.includes(from)) {
                    content = content.replace(fromPattern, to)
                    this.log(`  🔄 규칙 경로: "${from}" → "${to}"`)
                    changeCount++
                }
            }
        }

        if (!this.isDryRun && changeCount > 0) {
            fs.writeFileSync(filePath, content)
            this.log(`  ✅ ${fileName}: ${changeCount}개 규칙 경로 변환 완료`)
        } else if (this.isDryRun && changeCount > 0) {
            this.log(`  🔍 ${fileName}: ${changeCount}개 규칙 경로 변환 예정`)
        }

        return changeCount > 0
    }

    /**
     * 통합 브랜드 변환 실행
     */
    async executeConversion(fromBrand, toBrand, options = {}) {
        const { noBuild = false, brandConfig, includeBackend = true, includeFrontend = false } = options

        // 브랜드 설정 로드 - 전달받은 config 사용 또는 자동 탐지
        let config = brandConfig || null
        let frontConfig = null
        
        if (!config) {
            // 1. 현재 브랜드 설정 시도  
            const currentConfig = this.loadBrandConfig(fromBrand)
            const currentPackageMappings = currentConfig?.brand_mappings?.package_json || currentConfig?.brand_mappings?.pairs || {}
            if (Object.keys(currentPackageMappings).length > 0) {
                // 현재 브랜드 설정이 목표 브랜드와의 매핑을 포함하는지 확인
                const currentTarget = currentConfig.metadata?.target
                if (currentTarget === toBrand || currentConfig.metadata?.brand === toBrand) {
                    config = currentConfig
                }
            }
        }
        
        // 2. 목표 브랜드 설정 시도
        if (!config) {
            const targetConfig = this.loadBrandConfig(toBrand)
            const packageMappings = targetConfig?.brand_mappings?.package_json || targetConfig?.brand_mappings?.pairs || {}
            if (Object.keys(packageMappings).length > 0) {
                // 목표 브랜드 설정이 현재 브랜드와의 매핑을 포함하는지 확인
                const targetTarget = targetConfig.metadata?.target
                if (targetTarget === fromBrand || targetConfig.metadata?.brand === fromBrand) {
                    config = targetConfig
                }
            }
        }
        
        // 3. 설정을 찾지 못한 경우 에러
        if (!config && includeBackend) {
            this.error(`❌ 변환을 위한 브랜드 설정을 찾을 수 없습니다: ${fromBrand} → ${toBrand}`)
            return false
        }

        // 프론트엔드 설정 로드
        if (includeFrontend) {
            const frontConfigPath = path.join(this.brandsDir, fromBrand, 'brand-config-front.json')
            if (fs.existsSync(frontConfigPath)) {
                frontConfig = JSON.parse(fs.readFileSync(frontConfigPath, 'utf8'))
                this.log(`📱 프론트엔드 설정 로드됨: ${frontConfigPath}`)
            } else {
                // 목표 브랜드에서 찾기
                const targetFrontConfigPath = path.join(this.brandsDir, toBrand, 'brand-config-front.json')
                if (fs.existsSync(targetFrontConfigPath)) {
                    frontConfig = JSON.parse(fs.readFileSync(targetFrontConfigPath, 'utf8'))
                    this.log(`📱 프론트엔드 설정 로드됨: ${targetFrontConfigPath}`)
                }
            }
        }

        try {
            let textConverted = false
            let rulesConverted = false
            let frontConverted = false

            // 백엔드 변환
            if (includeBackend && config) {
                // 1. 텍스트 변환
                this.log(`📝 백엔드 텍스트 매핑 변환 시작`)
                textConverted = await this.convertText(fromBrand, toBrand, config)

                // 2. 규칙 파일 경로 변환
                this.log(`📋 백엔드 규칙 파일 경로 변환 시작`)
                rulesConverted = await this.convertRulePaths(fromBrand, toBrand, config)
            }

            // 프론트엔드 변환
            if (includeFrontend && frontConfig) {
                this.log(`📱 프론트엔드 파일 변환 시작`)
                frontConverted = await this.convertRulePaths(fromBrand, toBrand, frontConfig)
            }

            // 3. 이미지 복사
            this.log(`📂 이미지 파일 복사 시작`)
            const assetsConverted = await this.copyAssets(toBrand, fromBrand)

            if (textConverted || rulesConverted || frontConverted || assetsConverted) {
                this.log(`✅ 브랜드 변환 완료: ${fromBrand} → ${toBrand}`)
                if (includeBackend && !includeFrontend) {
                    this.log(`📌 백엔드 변환 완료`)
                } else if (!includeBackend && includeFrontend) {
                    this.log(`📌 프론트엔드 변환 완료`)
                } else {
                    this.log(`📌 백엔드 + 프론트엔드 변환 완료`)
                }
                
                // 빌드 실행 (npm이 없는 환경에서는 스킵)
                if (!this.isDryRun && !noBuild) {
                    await this.buildProject()
                } else if (noBuild) {
                    this.log(`🔧 빌드 스킵 (--no-build 옵션)`)
                }
                
                return true
            } else {
                this.warn(`⚠️ 변환할 내용이 없습니다`)
                return false
            }
        } catch (error) {
            this.error(`❌ 변환 실패: ${error.message}`)
            return false
        }
    }

    /**
     * 프로젝트 빌드 실행
     */
    async buildProject() {
        this.log(`🔧 프로젝트 빌드 시작`)
        
        try {
            // npm이 설치되어 있는지 확인
            const { execSync } = require('child_process')
            execSync('npm --version', { stdio: 'ignore' })
            
            // package.json에서 사용 가능한 빌드 스크립트 확인
            const packageJsonPath = path.join(this.projectRoot, 'package.json')
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
            const scripts = packageJson.scripts || {}
            
            // 우선순위 순서로 빌드 스크립트 시도
            const buildCommands = [
                'compile',
                'build', 
                'build:webview',
                'check-types'
            ]
            
            let executed = false
            for (const command of buildCommands) {
                if (scripts[command]) {
                    this.log(`  📦 실행 중: npm run ${command}`)
                    try {
                        execSync(`npm run ${command}`, { 
                            cwd: this.projectRoot, 
                            stdio: 'inherit' 
                        })
                        this.log(`  ✅ 빌드 완료: npm run ${command}`)
                        executed = true
                        break
                    } catch (error) {
                        this.warn(`  ⚠️ 빌드 실패: npm run ${command} - ${error.message}`)
                    }
                }
            }
            
            if (!executed) {
                this.warn(`  ⚠️ 사용 가능한 빌드 스크립트를 찾을 수 없습니다`)
                this.log(`  💡 사용 가능한 스크립트: ${Object.keys(scripts).join(', ')}`)
            }
            
        } catch (error) {
            this.warn(`  ⚠️ 빌드 스킵: npm이 설치되지 않았거나 빌드 환경이 준비되지 않음`)
        }
    }

    /**
     * 현재 상태 표시
     */
    showStatus() {
        const currentBrand = this.detectCurrentBrand()
        const packageJsonPath = path.join(this.projectRoot, 'package.json')
        
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
            
            console.log(`\n🎯 현재 브랜드 상태`)
            console.log(`   브랜드: ${currentBrand}`)
            console.log(`   이름: ${packageJson.displayName || 'N/A'}`)
            console.log(`   버전: ${packageJson.version || 'N/A'}`)
            console.log(`   작성자: ${packageJson.author?.name || 'N/A'}`)
            console.log(`   게시자: ${packageJson.publisher || 'N/A'}`)
        }

        // 사용 가능한 브랜드 목록
        console.log(`\n📋 사용 가능한 브랜드:`)
        const brands = this.getAvailableBrands()
        brands.forEach(brand => {
            const configPath = path.join(this.brandsDir, brand, 'brand-config.json')
            const status = fs.existsSync(configPath) ? '✅' : '❌'
            const current = brand === currentBrand ? ' (현재)' : ''
            console.log(`   ${status} ${brand}${current}`)
        })
    }

    /**
     * 헬퍼 메소드들
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((o, p) => o?.[p], obj)
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.')
        const lastKey = keys.pop()
        const target = keys.reduce((o, k) => o[k] = o[k] || {}, obj)
        target[lastKey] = value
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true })
        }
        
        const files = fs.readdirSync(src)
        for (const file of files) {
            const srcPath = path.join(src, file)
            const destPath = path.join(dest, file)
            
            if (fs.lstatSync(srcPath).isDirectory()) {
                this.copyDirectory(srcPath, destPath)
            } else {
                fs.copyFileSync(srcPath, destPath)
            }
        }
    }

    log(message) {
        console.log(message)
    }

    warn(message) {
        console.warn(message)
    }

    error(message) {
        console.error(message)
    }

    /**
     * 메인 실행 함수
     */
    async run() {
        const args = process.argv.slice(2)
        
        if (args.includes('--dry-run')) {
            this.isDryRun = true
            this.log('🔍 DRY-RUN 모드: 실제 변경하지 않습니다')
        }

        const noBuild = args.includes('--no-build')
        const backendOnly = args.includes('--backend')
        const frontendOnly = args.includes('--frontend')
        const all = args.includes('--all') || (!backendOnly && !frontendOnly)

        this.currentBrand = this.detectCurrentBrand()
        
        if (args.includes('--status') || args.length === 0) {
            this.showStatus()
            return
        }

        const nonOptionArgs = args.filter(arg => !arg.startsWith('--'))
        const brandName = nonOptionArgs[0]  // 브랜드명 (caret, codecenter 등)
        const direction = nonOptionArgs[1]  // forward 또는 backward
        
        if (!brandName || !direction) {
            const availableBrands = this.getAvailableBrands().filter(brand => 
                fs.existsSync(path.join(this.brandsDir, brand, 'brand-config.json'))
            )
            this.error(`❌ 사용법: node brand-converter.js [브랜드] [방향]`)
            this.error(`   브랜드: ${availableBrands.join(', ')}`)
            this.error(`   방향: forward, backward`)
            this.error(`   예시: node brand-converter.js caret forward`)
            return
        }
        
        if (!['forward', 'backward'].includes(direction)) {
            this.error(`❌ 방향은 'forward' 또는 'backward'만 가능합니다`)
            return
        }

        // 브랜드 설정 파일 로드 (동적 버전 매핑 포함)
        const config = this.loadBrandConfig(brandName)
        if (!config) {
            // loadBrandConfig 내부에서 이미 에러 메시지를 출력함
            return
        }

        const configBrand = config.metadata.brand
        const configTarget = config.metadata.target

        // 방향에 따라 from/to 결정
        let fromBrand, toBrand
        if (direction === 'forward') {
            // config의 target → brand 방향
            fromBrand = configTarget
            toBrand = configBrand
        } else {
            // config의 brand → target 방향 (역방향)
            fromBrand = configBrand
            toBrand = configTarget
        }

        this.log(`🚀 브랜드 변환 시작: ${fromBrand} → ${toBrand}`)

        // if (toBrand === this.currentBrand) {
        //     this.warn(`⚠️ 이미 ${toBrand} 브랜드입니다`)
        //     return
        // }

        const validBrands = this.getAvailableBrands()
        if (!validBrands.includes(toBrand)) {
            this.error(`❌ 지원되지 않는 브랜드: ${toBrand}`)
            this.error(`   지원되는 브랜드: ${validBrands.join(', ')}`)
            return
        }

        // 실행 옵션 설정
        const options = {
            noBuild,
            brandConfig: config,
            includeBackend: all || backendOnly,
            includeFrontend: all || frontendOnly
        }

        if (backendOnly) {
            this.log(`📋 백엔드만 변환합니다`)
        } else if (frontendOnly) {
            this.log(`📱 프론트엔드만 변환합니다`)
        } else {
            this.log(`📋 백엔드 + 프론트엔드 모두 변환합니다`)
        }

        await this.executeConversion(fromBrand, toBrand, options)
    }
}

// 스크립트 실행
if (require.main === module) {
    const converter = new BrandConverter()
    converter.run().catch(error => {
        console.error('❌ 실행 오류:', error)
        process.exit(1)
    })
}

module.exports = BrandConverter