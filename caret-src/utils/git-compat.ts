import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Provides compatibility for git utility functions that were removed from Cline's src/utils/git.ts.
 * This module should be used as a temporary bridge until Caret's features are fully migrated
 * to the new Cline APIs.
 */

/**
 * Gets the git diff of the current working directory.
 * This is a compatibility implementation for the removed `getGitDiff` function.
 * @param cwd The current working directory.
 * @returns A promise that resolves with the git diff as a string.
 */
export async function getGitDiff(cwd: string): Promise<string> {
  try {
    // CARET MODIFICATION: Re-implementing getGitDiff using child_process,
    // as it was removed from the original git.ts utility file.
    const { stdout } = await execAsync('git diff HEAD', { cwd });
    return stdout;
  } catch (error) {
    console.error('Error getting git diff:', error);
    // In case of an error (e.g., no commits yet), return an empty string
    // to maintain compatibility with the original function's expected behavior.
    return '';
  }
}
