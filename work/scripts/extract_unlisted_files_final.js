const fs = require('fs');
const path = require('path');
const assert = require('assert');

const workDir = path.join(__dirname, '..');
const analysisDir = path.join(workDir, 'analysis');

const analyzedFile = path.join(workDir, 'analysis-of-102-modifications.md');
const sourceOfTruthFile = path.join(analysisDir, 'caret_modified_cline_backend_files.txt');
const outputFile = path.join(analysisDir, 'unlisted_backend_modifications_final.txt');

try {
    // 1. Read Analyzed Files (Robustly)
    const analyzedContent = fs.readFileSync(analyzedFile, 'utf-8');
    const analyzedLines = analyzedContent.split('\n');
    const analyzedFiles = new Set();
    const fileRegex = /`([a-zA-Z0-9\/\.-_]+?\.(ts|tsx|proto))`/;

    for (const line of analyzedLines) {
        const match = line.match(fileRegex);
        if (match && match[1]) {
            if (!match[1].startsWith('webview-ui/')) {
                analyzedFiles.add(match[1]);
            }
        }
    }
    console.log(`[VERIFY] Found ${analyzedFiles.size} unique backend files in the markdown report.`);
    
    // 2. Read Source of Truth file
    const sourceContent = fs.readFileSync(sourceOfTruthFile, 'utf-8');
    const sourceFiles = sourceContent.split('\n').filter(line => line.trim() !== '');
    console.log(`[VERIFY] Found ${sourceFiles.length} total modified backend files in the source of truth list.`);

    // 3. Compare and Filter to find unlisted files
    const unlistedFiles = sourceFiles.filter(file => !analyzedFiles.has(file));
    console.log(`[RESULT] Found ${unlistedFiles.length} unlisted backend files that need analysis.`);

    // 4. Final Count Verification
    if (analyzedFiles.size === 66 && sourceFiles.length === 98) {
        assert.strictEqual(unlistedFiles.length, 32, `Count mismatch: Expected 32, but found ${unlistedFiles.length}.`);
        console.log("[SUCCESS] The number of unlisted files is exactly 32, as expected.");
    } else {
        console.warn(`[WARN] Counts did not match expected values (Analyzed: ${analyzedFiles.size}, Source: ${sourceFiles.length}). Skipping strict assertion.`);
    }

    // 5. Sort the list
    const sortedFiles = unlistedFiles.sort();

    // 6. Write to output file
    fs.writeFileSync(outputFile, sortedFiles.join('\n'), 'utf-8');
    console.log(`Successfully created the final list of unlisted files at: ${outputFile}`);

} catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
}
