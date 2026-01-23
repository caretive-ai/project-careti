/**
 * SmartEditEngine Tests
 *
 * CARETI MODIFICATION: Tests for 9-stage fuzzy matching
 */

import { expect } from "chai"
import {
	SmartEditEngine,
	levenshtein,
	similarity,
	trimDiff,
	SimpleReplacer,
	LineTrimmedReplacer,
	BlockAnchorReplacer,
	WhitespaceNormalizedReplacer,
	IndentationFlexibleReplacer,
} from "../index"

describe("SmartEditEngine", () => {
	describe("levenshtein", () => {
		it("should return 0 for identical strings", () => {
			expect(levenshtein("hello", "hello")).to.equal(0)
		})

		it("should return length for empty string comparison", () => {
			expect(levenshtein("hello", "")).to.equal(5)
			expect(levenshtein("", "world")).to.equal(5)
		})

		it("should calculate correct distance", () => {
			expect(levenshtein("kitten", "sitting")).to.equal(3)
			expect(levenshtein("hello", "hallo")).to.equal(1)
		})
	})

	describe("similarity", () => {
		it("should return 1 for identical strings", () => {
			expect(similarity("hello", "hello")).to.equal(1)
		})

		it("should return 1 for empty strings", () => {
			expect(similarity("", "")).to.equal(1)
		})

		it("should return value between 0 and 1", () => {
			const sim = similarity("hello", "hallo")
			expect(sim).to.be.greaterThan(0)
			expect(sim).to.be.lessThan(1)
		})
	})

	describe("Stage 1: SimpleReplacer", () => {
		it("should yield exact match", () => {
			const results = [...SimpleReplacer("hello world", "world")]
			expect(results).to.deep.equal(["world"])
		})
	})

	describe("Stage 2: LineTrimmedReplacer", () => {
		it("should match with different indentation", () => {
			const content = `function test() {
    const x = 1;
    return x;
}`
			const search = `const x = 1;
return x;`
			const results = [...LineTrimmedReplacer(content, search)]
			expect(results.length).to.be.greaterThan(0)
		})

		it("should handle trailing empty lines in search", () => {
			const content = "line1\nline2\nline3"
			const search = "line1\nline2\n"
			const results = [...LineTrimmedReplacer(content, search)]
			expect(results.length).to.be.greaterThan(0)
		})
	})

	describe("Stage 3: BlockAnchorReplacer", () => {
		it("should skip blocks with less than 3 lines", () => {
			const content = "line1\nline2"
			const search = "line1\nline2"
			const results = [...BlockAnchorReplacer(content, search)]
			expect(results).to.deep.equal([])
		})
	})

	describe("Stage 4: WhitespaceNormalizedReplacer", () => {
		it("should match with collapsed whitespace", () => {
			const content = "const   x   =   1;"
			const search = "const x = 1;"
			const results = [...WhitespaceNormalizedReplacer(content, search)]
			expect(results.length).to.be.greaterThan(0)
		})

		it("should handle multi-line blocks", () => {
			const content = "line1   extra\nline2   more"
			const search = "line1 extra\nline2 more"
			const results = [...WhitespaceNormalizedReplacer(content, search)]
			expect(results.length).to.be.greaterThan(0)
		})
	})

	describe("Stage 5: IndentationFlexibleReplacer", () => {
		it("should match with different base indentation", () => {
			const content = `    function test() {
        const x = 1;
    }`
			const search = `function test() {
    const x = 1;
}`
			const results = [...IndentationFlexibleReplacer(content, search)]
			expect(results.length).to.be.greaterThan(0)
		})
	})

	describe("smartReplace", () => {
		const engine = new SmartEditEngine()

		it("should perform exact replacement", () => {
			const content = "hello world"
			const result = engine.smartReplace(content, "world", "universe")
			expect(result.success).to.be.true
			expect(result.content).to.equal("hello universe")
			expect(result.matchedWith).to.equal("SimpleReplacer")
		})

		it("should fail with error for same strings", () => {
			const content = "hello world"
			const result = engine.smartReplace(content, "world", "world")
			expect(result.success).to.be.false
			expect(result.error).to.include("must be different")
		})

		it("should fail when string not found", () => {
			const content = "hello world"
			const result = engine.smartReplace(content, "galaxy", "universe")
			expect(result.success).to.be.false
			expect(result.error).to.include("not found")
		})

		it("should handle replaceAll", () => {
			const content = "hello world, hello universe"
			const result = engine.smartReplace(content, "hello", "goodbye", true)
			expect(result.success).to.be.true
			expect(result.content).to.equal("goodbye world, goodbye universe")
		})

		it("should fail for multiple matches without replaceAll", () => {
			const content = "hello world, hello universe"
			const result = engine.smartReplace(content, "hello", "goodbye", false)
			expect(result.success).to.be.false
			expect(result.error).to.include("multiple matches")
		})

		it("should use fallback matchers when exact match fails", () => {
			const content = `function test() {
    const x = 1;
    return x;
}`
			// Search with different indentation
			const search = `function test() {
  const x = 1;
  return x;
}`
			const replacement = `function test() {
  const x = 2;
  return x;
}`
			const result = engine.smartReplace(content, search, replacement)
			expect(result.success).to.be.true
			expect(result.matchedWith).to.not.equal("SimpleReplacer")
		})
	})

	describe("getContextAroundError", () => {
		const engine = new SmartEditEngine()

		it("should return context around potential match", () => {
			const content = `line 1
line 2
line 3
target line here
line 5
line 6
line 7`
			const search = "target line"
			const context = engine.getContextAroundError(content, search, 2)
			expect(context).to.include("target")
			expect(context).to.include(":")
		})

		it("should return first lines when no match found", () => {
			const content = `line 1
line 2
line 3
line 4
line 5`
			const search = "xyz not found"
			const context = engine.getContextAroundError(content, search, 2)
			expect(context).to.include("line 1")
		})
	})

	describe("trimDiff", () => {
		it("should trim common indentation from diff", () => {
			const diff = `--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,3 @@
     const x = 1;
-    const y = 2;
+    const y = 3;
     const z = 4;`
			const trimmed = trimDiff(diff)
			expect(trimmed).to.include("const x = 1;")
			expect(trimmed).to.not.include("    const x = 1;")
		})

		it("should preserve diff markers", () => {
			const diff = `--- a/file.ts
+++ b/file.ts
-old line
+new line`
			const trimmed = trimDiff(diff)
			expect(trimmed).to.include("--- a/file.ts")
			expect(trimmed).to.include("+++ b/file.ts")
		})
	})

	describe("Korean/Unicode handling", () => {
		const engine = new SmartEditEngine()

		it("should handle Korean text exact match", () => {
			const content = "안녕하세요 세계"
			const result = engine.smartReplace(content, "세계", "우주")
			expect(result.success).to.be.true
			expect(result.content).to.equal("안녕하세요 우주")
		})

		it("should handle Korean with whitespace variations", () => {
			const content = "const   greeting   =   '안녕하세요';"
			const search = "const greeting = '안녕하세요';"
			const result = engine.smartReplace(content, search, "const greeting = 'hello';")
			expect(result.success).to.be.true
		})

		it("should handle mixed Korean/English code", () => {
			const content = `// 함수 정의
function sayHello() {
    console.log("안녕하세요");
}`
			const search = `// 함수 정의
function sayHello() {
    console.log("안녕하세요");
}`
			const replacement = `// Function definition
function sayHello() {
    console.log("Hello");
}`
			const result = engine.smartReplace(content, search, replacement)
			expect(result.success).to.be.true
		})
	})

	describe("Edge cases", () => {
		const engine = new SmartEditEngine()

		it("should handle empty content", () => {
			const result = engine.smartReplace("", "something", "other")
			expect(result.success).to.be.false
		})

		it("should handle single character replacements", () => {
			const result = engine.smartReplace("a", "a", "b")
			expect(result.success).to.be.true
			expect(result.content).to.equal("b")
		})

		it("should handle newlines in search and replace", () => {
			const content = "line1\nline2\nline3"
			const result = engine.smartReplace(content, "line1\nline2", "lineA\nlineB")
			expect(result.success).to.be.true
			expect(result.content).to.equal("lineA\nlineB\nline3")
		})

		it("should preserve trailing content", () => {
			const content = "prefix middle suffix"
			const result = engine.smartReplace(content, "middle", "MIDDLE")
			expect(result.success).to.be.true
			expect(result.content).to.equal("prefix MIDDLE suffix")
		})
	})

	describe("Performance baseline", () => {
		const engine = new SmartEditEngine()
		const largeContent = Array.from({ length: 1000 }, (_, i) => `line ${i}: const value${i} = ${i};`).join("\n")

		it("should handle large files efficiently", () => {
			const start = performance.now()
			const result = engine.smartReplace(largeContent, "const value500 = 500;", "const value500 = 999;")
			const duration = performance.now() - start

			expect(result.success).to.be.true
			expect(duration).to.be.lessThan(100) // Should complete in under 100ms
		})

		it("should handle fuzzy matching on large files", () => {
			const start = performance.now()
			// Indentation difference
			const search = "  const value500 = 500;"
			const result = engine.smartReplace(largeContent, search, "const value500 = 999;")
			const duration = performance.now() - start

			// May or may not succeed depending on exact matching
			expect(duration).to.be.lessThan(500) // Should complete in under 500ms even with fuzzy matching
		})
	})
})
