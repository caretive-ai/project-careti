#!/usr/bin/env node

/**
 * Brand Config Validator
 * brand-config.json 파일들의 유효성 검사 및 수정
 * 
 * @author Luke Yang + Claude Code
 */

const fs = require('fs')
const path = require('path')

class BrandConfigValidator {
    constructor() {
        this.projectRoot = process.cwd()
        this.brandsDir = path.join(this.projectRoot, 'caret-b2b', 'brands')
        this.issues = []
    }

    /**
     * 모든 브랜드 설정 검증
     */
    validateAllConfigs() {
        console.log('🔍 Brand Config 유효성 검사 시작...\n')
        
        const brands = ['caret', 'codecenter']
        
        for (const brand of brands) {
            console.log(`📋 ${brand} 브랜드 검사 중...`)
            this.validateBrandConfig(brand)
            console.log('')
        }
        
        this.showSummary()
        return this.issues.length === 0
    }

    /**
     * 개별 브랜드 설정 검증
     */
    validateBrandConfig(brand) {
        const configPath = path.join(this.brandsDir, brand, 'brand-config.json')
        
        if (!fs.existsSync(configPath)) {
            this.addIssue(brand, 'MISSING_CONFIG', `설정 파일이 없습니다: ${configPath}`)
            return
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
            
            // 1. 필수 구조 검사
            this.validateStructure(brand, config)
            
            // 2. 매핑 중복 검사
            this.validateMappingDuplicates(brand, config)
            
            // 3. caretrules 매핑 검사
            this.validateCarerulesMapping(brand, config)
            
            // 4. URL 일관성 검사
            this.validateUrlConsistency(brand, config)
            
        } catch (error) {
            this.addIssue(brand, 'PARSE_ERROR', `JSON 파싱 오류: ${error.message}`)
        }
    }

    /**
     * 필수 구조 검증
     */
    validateStructure(brand, config) {
        const required = ['metadata', 'brand_mappings', 'package_fields', 'terminal']
        
        for (const field of required) {
            if (!config[field]) {
                this.addIssue(brand, 'MISSING_FIELD', `필수 필드 누락: ${field}`)
            }
        }

        if (config.brand_mappings && !config.brand_mappings.pairs) {
            this.addIssue(brand, 'MISSING_PAIRS', 'brand_mappings.pairs가 없습니다')
        }
    }

    /**
     * 매핑 중복 검사
     */
    validateMappingDuplicates(brand, config) {
        if (!config.brand_mappings?.pairs) return

        const pairs = config.brand_mappings.pairs
        const keys = Object.keys(pairs)
        const values = Object.values(pairs)

        // 키 중복 검사 (JSON에서는 자동으로 마지막 값으로 덮어쓰므로 실질적 중복 없음)
        const keySet = new Set(keys)
        if (keySet.size !== keys.length) {
            this.addIssue(brand, 'DUPLICATE_KEYS', '매핑에 중복 키가 있을 수 있습니다')
        }

        // 값 중복 검사
        const valueSet = new Set(values)
        if (valueSet.size !== values.length) {
            const duplicates = values.filter((v, i) => values.indexOf(v) !== i)
            this.addIssue(brand, 'DUPLICATE_VALUES', `매핑에 중복 값: ${[...new Set(duplicates)].join(', ')}`)
        }

        // 키-값 충돌 검사 (키가 다른 키의 값으로 사용되는 경우)
        for (const key of keys) {
            if (values.includes(key)) {
                this.addIssue(brand, 'KEY_VALUE_CONFLICT', `키 "${key}"가 다른 매핑의 값으로도 사용됩니다`)
            }
        }
    }

    /**
     * caretrules 매핑 검사
     */
    validateCarerulesMapping(brand, config) {
        if (!config.brand_mappings?.pairs) return

        const pairs = config.brand_mappings.pairs
        const hasClinerules = Object.keys(pairs).some(key => key.includes('clinerules'))
        const hasCaretrules = Object.keys(pairs).some(key => key.includes('caretrules'))
        const hasDocuments = Object.keys(pairs).some(key => key.includes('Documents'))

        if (brand === 'caret' && !hasClinerules) {
            this.addIssue(brand, 'MISSING_CARETRULES', '.clinerules ↔ .caretrules 매핑이 누락되었습니다')
        }
        
        if (brand === 'caret' && !hasDocuments) {
            this.addIssue(brand, 'MISSING_DOCUMENTS', 'Documents/Cline ↔ Documents/Caret 매핑이 누락되었습니다')
        }
    }

    /**
     * URL 일관성 검사
     */
    validateUrlConsistency(brand, config) {
        if (!config.brand_mappings?.pairs) return

        const pairs = config.brand_mappings.pairs
        const urlKeys = Object.keys(pairs).filter(key => key.includes('http') || key.includes('.com') || key.includes('.team'))
        
        // URL과 도메인이 일치하는지 확인
        for (const urlKey of urlKeys) {
            if (urlKey.includes('caret.team') && !urlKey.startsWith('https://')) {
                const httpsVersion = `https://${urlKey}`
                if (pairs[httpsVersion]) {
                    this.addIssue(brand, 'URL_INCONSISTENCY', `"${urlKey}"와 "${httpsVersion}" 둘 다 있어 충돌 가능`)
                }
            }
        }
    }

    /**
     * 이슈 추가
     */
    addIssue(brand, type, message) {
        this.issues.push({ brand, type, message })
        console.log(`  ❌ ${type}: ${message}`)
    }

    /**
     * 결과 요약
     */
    showSummary() {
        console.log('📊 검사 결과 요약:')
        console.log(`   총 이슈: ${this.issues.length}개`)
        
        if (this.issues.length === 0) {
            console.log('   🎉 모든 설정 파일이 유효합니다!')
        } else {
            console.log('\n🔧 수정이 필요한 이슈들:')
            const groupedIssues = this.groupIssuesByBrand()
            
            for (const [brand, issues] of Object.entries(groupedIssues)) {
                console.log(`\n   📋 ${brand}:`)
                for (const issue of issues) {
                    console.log(`      • ${issue.type}: ${issue.message}`)
                }
            }
        }
    }

    /**
     * 브랜드별 이슈 그룹핑
     */
    groupIssuesByBrand() {
        const grouped = {}
        for (const issue of this.issues) {
            if (!grouped[issue.brand]) {
                grouped[issue.brand] = []
            }
            grouped[issue.brand].push(issue)
        }
        return grouped
    }

    /**
     * 자동 수정 (안전한 것들만)
     */
    autoFix() {
        console.log('\n🔧 자동 수정 가능한 이슈들을 수정합니다...')
        
        // caret 브랜드에 caretrules 매핑 추가
        this.fixCaretCarerulesMapping()
        
        console.log('✅ 자동 수정 완료. 다시 검사를 실행해보세요.')
    }

    /**
     * caret 브랜드에 caretrules 매핑 추가
     */
    fixCaretCarerulesMapping() {
        const configPath = path.join(this.brandsDir, 'caret', 'brand-config.json')
        
        if (!fs.existsSync(configPath)) return

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
            
            if (!config.brand_mappings?.pairs) return

            // caretrules 매핑이 없으면 추가
            const pairs = config.brand_mappings.pairs
            
            if (!pairs['.caretrules']) {
                pairs['.caretrules'] = '.clinerules'
                console.log('   ✅ caret 브랜드에 .caretrules ↔ .clinerules 매핑 추가')
            }
            
            if (!pairs['Documents/Caret']) {
                pairs['Documents/Caret'] = 'Documents/Cline'
                console.log('   ✅ caret 브랜드에 Documents/Caret ↔ Documents/Cline 매핑 추가')
            }

            // 파일 저장
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
            
        } catch (error) {
            console.log(`   ❌ caret 설정 수정 실패: ${error.message}`)
        }
    }
}

// 스크립트 실행
if (require.main === module) {
    const validator = new BrandConfigValidator()
    
    const args = process.argv.slice(2)
    
    if (args.includes('--fix')) {
        validator.autoFix()
    } else {
        const isValid = validator.validateAllConfigs()
        
        if (!isValid) {
            console.log('\n💡 자동 수정을 원하면 --fix 옵션을 사용하세요:')
            console.log('   node brand-config-validator.js --fix')
        }
        
        process.exit(isValid ? 0 : 1)
    }
}

module.exports = BrandConfigValidator