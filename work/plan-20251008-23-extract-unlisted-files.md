# Plan: Extract Unlisted Backend Files for Further Analysis

## 1. Objective
To identify and list all backend files from the "Source of Truth" (`caret_modified_cline_backend_files.txt`) that are **not** already documented in `analysis-of-102-modifications.md`. This will create a focused list of files that require manual analysis.

## 2. Methodology
A Node.js script will be created to perform the comparison and extraction accurately.

## 3. Execution Steps

### Step 3.1: Create the Extraction Script
- **Action**: Write a new Node.js script to `work/scripts/extract_unlisted_files.js`.
- **Script Logic**:
    1.  **Read Analyzed Files**: Read `work/analysis-of-102-modifications.md` and extract all backend file paths into a `Set` for efficient lookup.
    2.  **Read Source of Truth**: Read the complete list of 98 modified backend files from `work/analysis/caret_modified_cline_backend_files.txt`.
    3.  **Compare and Filter**: Iterate through the "Source of Truth" list and filter out any file that is already present in the analyzed files set.
    4.  **Sort**: Sort the resulting list of unlisted files alphabetically.
    5.  **Write Output**: Save the filtered list to a new file: `work/analysis/unlisted_backend_modifications.txt`.

### Step 3.2: Execute the Script
- **Action**: Run the created script using `node work/scripts/extract_unlisted_files.js`.

### Step 3.3: Report Completion
- **Action**: Confirm the successful creation of the unlisted files list and provide the path to the new file (`work/analysis/unlisted_backend_modifications.txt`) for review. This list will serve as the basis for the next phase of manual analysis.
