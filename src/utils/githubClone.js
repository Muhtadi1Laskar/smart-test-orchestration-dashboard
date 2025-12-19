import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'os';

const execPromise = promisify(exec);

export const cloneGithubRepo = async (repoURL, id) => {
    try {
        const outputDir = path.join(os.tmpdir(), `github-clone-${id}`);
        await fs.mkdir(outputDir, { recursive: true });

        console.log(`Cloning ${repoURL} in ${outputDir}`);

        const { stdout, stderr } = await execPromise(`git clone ${repoURL} "${outputDir}"`);

        if (stderr && !stderr.includes("Cloning into") && !stderr.trim().startsWith("remote:")) {
            return {
                success: false,
                error: {
                    type: "CLONE_FAILED",
                    message: `Git clone failed: ${stderr.trim()}`
                }
            };
        }

        return { success: true, outputDir };
    } catch (error) {
        return {
            success: false,
            error: {
                type: 'CLONE_FAILED',
                message: `Failed to clone repository: ${error.message || 'Unknown error'}`
            }
        };
    }
}

export const installModules = async (repoPath, timeoutMs = 300_000) => {
    if (!repoPath || typeof repoPath !== 'string') {
        return {
            success: false,
            error: {
                type: 'INVALID_INPUT',
                message: 'Invalid repository path'
            }
        };
    }

    const absPath = path.resolve(repoPath);

    const fs = await import('fs/promises');
    try {
        await fs.access(path.join(absPath, 'package.json'));
    } catch {
        return {
            success: false,
            error: {
                type: 'MISSING_PACKAGE_JSON',
                message: 'The repository is missing a package.json file. Please ensure your test suite includes one with @playwright/test in devDependencies.'
            }
        };
    }

    return new Promise((resolve) => {
        const npmProcess = spawn('npm', ['ci', '--ignore-scripts'], {
            cwd: absPath,
            env: { ...process.env },
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: process.platform === 'win32'
        });

        let stdout = '';
        let stderr = '';

        npmProcess.stdout?.on('data', (data) => {
            stdout += data.toString();
        });

        npmProcess.stderr?.on('data', (data) => {
            stderr += data.toString();
        });

        npmProcess.on('error', (err) => {
            resolve({
                success: false,
                stdout: '',
                stderr: '',
                error: {
                    type: 'INSTALL_FAILED',
                    message: `Failed to start npm install: ${err.message}`
                }
            });
        });

        const timeout = setTimeout(() => {
            npmProcess.kill();
            resolve({
                success: false,
                stdout,
                stderr,
                error: {
                    type: 'INSTALL_TIMEOUT',
                    message: `Dependency installation timed out after ${timeoutMs / 1000} seconds. The repository may be too large or have network issues.`
                }
            });
        }, timeoutMs);

        npmProcess.on('close', (code) => {
            clearTimeout(timeout);

            if (code === 0) {
                resolve({
                    success: true,
                    stdout,
                    stderr,
                    error: null
                });
            } else {
                resolve({
                    success: false,
                    stdout,
                    stderr,
                    error: {
                        type: 'INSTALL_FAILED',
                        message: `npm install failed with exit code ${code}. Details: ${stderr || stdout}`
                    }
                });
            }
        });
    });
};