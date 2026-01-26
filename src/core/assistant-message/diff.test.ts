import { expect } from "chai"
import { describe, it } from "mocha"
import { constructNewFileContent as cnfc } from "./diff"

async function cnfc2(diffContent: string, originalContent: string, isFinal: boolean): Promise<string> {
	return cnfc(diffContent, originalContent, isFinal, "v2")
}

describe("constructNewFileContent", () => {
	const testCases = [
		{
			name: "empty file",
			original: "",
			diff: `------- SEARCH
=======
new content
+++++++ REPLACE`,
			expected: "new content\n",
			isFinal: true,
		},
		{
			name: "malformed search - mixed symbols",
			original: "line1\nline2\nline3",
			diff: `<<-- SEARCH
line2
=======
replaced
+++++++ REPLACE`,
			shouldThrow: true,
		},
		{
			name: "malformed search - insufficient dashes",
			original: "line1\nline2\nline3",
			diff: `-- SEARCH
line2
=======
replaced
+++++++ REPLACE`,
			shouldThrow: true,
		},
		{
			name: "malformed search - missing space",
			original: "line1\nline2\nline3",
			diff: `-------SEARCH
line2
=======
replaced
+++++++ REPLACE`,
			shouldThrow: true,
		},
		{
			name: "exact match replacement",
			original: "line1\nline2\nline3",
			diff: `------- SEARCH
line2
=======
replaced
+++++++ REPLACE`,
			expected: "line1\nreplaced\nline3",
			isFinal: true,
		},
		{
			name: "line-trimmed match replacement",
			original: "line1\n line2 \nline3",
			diff: `------- SEARCH
line2
=======
replaced
+++++++ REPLACE`,
			expected: "line1\nreplaced\nline3",
			isFinal: true,
		},
		{
			name: "block anchor match replacement",
			original: "line1\nstart\nmiddle\nend\nline5",
			diff: `------- SEARCH
start
middle
end
=======
replaced
+++++++ REPLACE`,
			expected: "line1\nreplaced\nline5",
			isFinal: true,
		},
		{
			name: "incremental processing",
			original: "line1\nline2\nline3",
			diff: [
				`------- SEARCH
line2
=======`,
				"replaced\n",
				"+++++++ REPLACE",
			].join("\n"),
			expected: "line1\nreplaced\n\nline3",
			isFinal: true,
		},
		{
			name: "final chunk with remaining content",
			original: "line1\nline2\nline3",
			diff: `------- SEARCH
line2
=======
replaced
+++++++ REPLACE`,
			expected: "line1\nreplaced\nline3",
			isFinal: true,
		},
		{
			name: "multiple ordered replacements",
			original: "First\nSecond\nThird\nFourth",
			diff: `------- SEARCH
First
=======
1st
+++++++ REPLACE

------- SEARCH
Third
=======
3rd
+++++++ REPLACE`,
			expected: "1st\nSecond\n3rd\nFourth",
			isFinal: true,
		},
		{
			name: "replace then delete",
			original: "line1\nline2\nline3\nline4",
			diff: `------- SEARCH
line2
=======
replaced
+++++++ REPLACE

------- SEARCH
line4
=======
+++++++ REPLACE`,
			expected: "line1\nreplaced\nline3\n",
			isFinal: true,
		},
		{
			name: "delete then replace",
			original: "line1\nline2\nline3\nline4",
			diff: `------- SEARCH
line1
=======
+++++++ REPLACE

------- SEARCH
line3
=======
replaced
+++++++ REPLACE`,
			expected: "line2\nreplaced\nline4",
			isFinal: true,
		},
		{
			name: "malformed diff - missing separator",
			original: "line1\nline2\nline3",
			diff: `------- SEARCH
line2
+++++++ REPLACE
replaced`,
			shouldThrow: true,
		},
		{
			name: "malformed diff - trailing space on separator",
			original: "line1\nline2\nline3",
			diff: `------- SEARCH
line2
======= 
replaced
+++++++ REPLACE`,
			shouldThrow: true,
		},
		{
			name: "malformed diff - double replace markers",
			original: "line1\nline2\nline3",
			diff: `------- SEARCH
line2
+++++++ REPLACE
first replacement
+++++++ REPLACE`,
			shouldThrow: true,
		},
		{
			name: "malformed diff - malformed separator with dashes",
			original: "line1\nline2\nline3",
			diff: `------- SEARCH
line2
------- =======
replaced
+++++++ REPLACE`,
			shouldThrow: true,
		},
	]
	//.filter(({name}) => name === "multiple ordered replacements")
	//.filter(({name}) => name === "delete then replace")
	testCases.forEach(({ name, original, diff, expected, isFinal, shouldThrow }) => {
		it(`should handle ${name} case correctly`, async () => {
			if (shouldThrow) {
				try {
					await cnfc(diff, original, isFinal ?? true)
					expect.fail("Expected an error to be thrown")
				} catch (err) {
					expect(err).to.be.an("error")
				}

				try {
					await cnfc2(diff, original, isFinal ?? true)
					expect.fail("Expected an error to be thrown")
				} catch (err) {
					expect(err).to.be.an("error")
				}
			} else {
				const result1 = await cnfc(diff, original, isFinal ?? true)
				const result2 = await cnfc2(diff, original, isFinal ?? true)
				const _equal = result1 === result2
				const _equal2 = result1 === expected
				// Verify both implementations produce same result
				expect(result1).to.equal(result2)

				// Verify result matches expected
				expect(result1).to.equal(expected)
			}
		})
	})

	it("should throw error when no match found", async () => {
		const original = "line1\nline2\nline3"
		const diff = `------- SEARCH
non-existent
=======
replaced
+++++++ REPLACE`

		try {
			await cnfc(diff, original, true)
			expect.fail("Expected an error to be thrown")
		} catch (err) {
			expect(err).to.be.an("error")
		}

		try {
			await cnfc2(diff, original, true)
			expect.fail("Expected an error to be thrown")
		} catch (err) {
			expect(err).to.be.an("error")
		}
	})

	it("should handle missing final REPLACE marker when isFinal is true", async () => {
		const original = "line1\nline2\nline3"
		const diff = `------- SEARCH
line2
=======
replaced`
		// Note: missing +++++++ REPLACE marker

		const result1 = await cnfc(diff, original, true) // isFinal = true

		// Should still work and replace line2 with "replaced"
		const expected = "line1\nreplaced\nline3"

		expect(result1).to.equal(expected)
	})

	it("should handle missing final REPLACE marker with multiple lines of replacement", async () => {
		const original = "function test() {\n\tconst a = 1;\n\treturn a;\n}"
		const diff = `------- SEARCH
	const a = 1;
	return a;
=======
	const a = 42;
	console.log('updated');
	return a;`
		// Note: missing +++++++ REPLACE marker

		const result1 = await cnfc(diff, original, true) // isFinal = true
		const expected = "function test() {\n\tconst a = 42;\n\tconsole.log('updated');\n\treturn a;\n}"

		expect(result1).to.equal(expected)
	})

	// 	it("should NOT process incomplete replacement when isFinal is false", async () => {
	// 		const original = "line1\nline2\nline3"
	// 		const diff = `------- SEARCH
	// line2
	// =======
	// replaced`
	// 		// Note: missing +++++++ REPLACE marker AND isFinal = false

	// 		const result1 = await cnfc(diff, original, false) // isFinal = false

	// 		// Should not make any changes since the block is incomplete
	// 		const expected = "line1\nline2\nline3"

	// 		expect(result1).to.equal(expected)
	// 	})
})

// Test cases for out-of-order search/replace blocks

describe("Diff Format Out of Order Cases", () => {
	it("should handle out-of-order replacements with different positions", async () => {
		const isFinal = true
		const original = "first\nsecond\nthird\nfourth\n"
		const diff = `------- SEARCH
fourth
=======
new fourth
+++++++ REPLACE
------- SEARCH
second
=======
new second
+++++++ REPLACE`
		const result1 = await cnfc(diff, original, isFinal)
		const expectedResult = "first\nnew second\nthird\nnew fourth\n"
		expect(result1).to.equal(expectedResult)
	})

	it("should handle multiple out-of-order replacements", async () => {
		const isFinal = true
		const original = "one\ntwo\nthree\nfour\nfive\n"
		const diff = `------- SEARCH
four
=======
fourth
+++++++ REPLACE
------- SEARCH
two
=======
second
+++++++ REPLACE
------- SEARCH
five
=======
fifth
+++++++ REPLACE`
		const result1 = await cnfc(diff, original, isFinal)
		const expectedResult = "one\nsecond\nthree\nfourth\nfifth\n"
		expect(result1).to.equal(expectedResult)
	})

	it("should handle out-of-order replacements with indentation", async () => {
		const isFinal = true
		const original = "function test() {\n\tconst a = 1;\n\tconst b = 2;\n\tconst c = 3;\n\n}"
		const diff = `------- SEARCH
	const c = 3;
=======
	const c = 30;
+++++++ REPLACE
------- SEARCH
	const a = 1;
=======
	const a = 10;
+++++++ REPLACE`
		const result1 = await cnfc(diff, original, isFinal)
		const expectedResult = "function test() {\n\tconst a = 10;\n\tconst b = 2;\n\tconst c = 30;\n\n}"
		expect(result1).to.equal(expectedResult)
	})

	it("should handle out-of-order replacements with empty lines", async () => {
		const isFinal = true
		const original = "header\n\nbody\n\nfooter\n"
		const diff = `------- SEARCH
footer
=======
new footer
+++++++ REPLACE
------- SEARCH

body

=======
new body content
+++++++ REPLACE`
		const result1 = await cnfc(diff, original, isFinal)
		const expectedResult = "header\nnew body content\nnew footer\n"
		expect(result1).to.equal(expectedResult)
	})
})

// CARETI MODIFICATION: Test cases for enhanced fallback stages (T20)
describe("Enhanced Fallback Matching (T20)", () => {
	describe("Whitespace Normalized Fallback", () => {
		it("should match with collapsed whitespace", async () => {
			const original = "const   value  =   'hello';\nconst other = 'world';"
			const diff = `------- SEARCH
const value = 'hello';
=======
const value = 'updated';
+++++++ REPLACE`
			// Note: search has single spaces but original has multiple spaces
			const result = await cnfc(diff, original, true)
			expect(result).to.equal("const value = 'updated';\nconst other = 'world';")
		})

		it("should match with tab vs space differences", async () => {
			const original = "function\ttest() {\n\treturn true;\n}"
			const diff = `------- SEARCH
function test() {
=======
function test(): boolean {
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			expect(result).to.equal("function test(): boolean {\n\treturn true;\n}")
		})
	})

	describe("Indentation Flexible Fallback", () => {
		it("should match with different indentation levels", async () => {
			const original = "function outer() {\n\t\tfunction inner() {\n\t\t\treturn 1;\n\t\t}\n}"
			const diff = `------- SEARCH
function inner() {
	return 1;
}
=======
function inner() {
	return 2;
}
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			// The replacement should be applied with adjusted indentation
			expect(result).to.include("return 2")
		})

		it("should match code indented differently in search block", async () => {
			const original = "class Test {\n    method() {\n        console.log('test');\n    }\n}"
			const diff = `------- SEARCH
method() {
    console.log('test');
}
=======
method() {
    console.log('updated');
}
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			expect(result).to.include("console.log('updated')")
		})
	})

	describe("Block Anchor with Levenshtein Scoring", () => {
		it("should select best match when multiple anchors match", async () => {
			// Two blocks with same start/end but different middle content
			const original = `function start() {
  const a = 1;
  return a;
}

function start() {
  const b = 2;
  return b;
}`
			const diff = `------- SEARCH
function start() {
  const b = 2;
  return b;
}
=======
function start() {
  const b = 999;
  return b;
}
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			// Should match the second block (higher similarity for middle lines)
			expect(result).to.include("const b = 999")
			expect(result).to.include("const a = 1") // First block unchanged
		})

		it("should match block with similar middle lines", async () => {
			const original = `// Header
function process(data) {
  validate(data);
  transform(data);
  return data;
}
// Footer`
			const diff = `------- SEARCH
function process(data) {
  validate(data);
  transform(data);
  return data;
}
=======
function process(data) {
  validate(data);
  sanitize(data);
  transform(data);
  return data;
}
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			expect(result).to.include("sanitize(data)")
		})
	})

	describe("Trimmed Boundary Fallback", () => {
		it("should match with trimmed boundaries", async () => {
			const original = "  \n  const value = 1;  \n  "
			const diff = `------- SEARCH
const value = 1;
=======
const value = 2;
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			expect(result).to.include("const value = 2")
		})

		it("should handle search block with extra whitespace at boundaries", async () => {
			const original = "prefix\nconst x = 1;\nsuffix"
			const diff = `------- SEARCH

const x = 1;

=======
const x = 2;
+++++++ REPLACE`
			// Search has extra empty lines but should match trimmed
			const result = await cnfc(diff, original, true)
			expect(result).to.include("const x = 2")
		})
	})

	describe("Context Aware Fallback", () => {
		it("should match using first/last line anchors with flexible middle", async () => {
			const original = `function handler() {
  // complex logic
  const result = process();
  // more logic
  return result;
}`
			const diff = `------- SEARCH
function handler() {
  // slightly different middle
  const result = process();
  return result;
}
=======
function handler() {
  const result = enhancedProcess();
  return result;
}
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			expect(result).to.include("enhancedProcess")
		})
	})

	describe("Escape Normalized Fallback", () => {
		it("should handle escaped newlines", async () => {
			const original = 'const str = "hello\\nworld";\nconst other = true;'
			const diff = `------- SEARCH
const str = "hello
world";
=======
const str = "hello\\nworld";
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			// Test that escape normalization works
			expect(result).to.include("const str")
		})
	})

	describe("Combined Fallback Scenarios", () => {
		it("should fall through multiple stages until match found", async () => {
			// This should fail exact, line-trimmed, but pass on whitespace/indentation
			const original = `class MyClass {
    constructor() {
        this.value = 1;
    }
}`
			const diff = `------- SEARCH
constructor() {
  this.value = 1;
}
=======
constructor() {
  this.value = 42;
}
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			expect(result).to.include("this.value = 42")
		})

		it("should handle real-world fuzzy matching scenario", async () => {
			const original = `export function processData(input: string): Result {
    // Validate input
    if (!input) {
        throw new Error('Invalid input');
    }

    // Process the data
    const processed = input.trim();

    return { data: processed };
}`
			const diff = `------- SEARCH
    // Process the data
    const processed = input.trim();

    return { data: processed };
=======
    // Process and transform the data
    const processed = input.trim().toUpperCase();

    return { data: processed, timestamp: Date.now() };
+++++++ REPLACE`
			const result = await cnfc(diff, original, true)
			expect(result).to.include("toUpperCase")
			expect(result).to.include("timestamp")
		})
	})
})
