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

        if (stderr && !stderr.includes("Cloning into")) {
            console.warn("Git Waning/Error:", stderr);
        }

        return outputDir;
    } catch (error) {
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
}

export const installModules = async (repoPath, timeoutMs = 300_000) => {
    // Validate input
    if (!repoPath || typeof repoPath !== 'string') {
        throw new Error('Invalid repoPath: must be a non-empty string');
    }

    // Resolve to absolute path to avoid surprises
    const absPath = path.resolve(repoPath);

    // Check if package.json exists (fail fast)
    const fs = await import('fs/promises');
    try {
        await fs.access(path.join(absPath, 'package.json'));
    } catch {
        throw new Error(`package.json not found in ${absPath}. Is this a valid Node.js project?`);
    }

    return new Promise((resolve) => {
        const npmProcess = spawn('npm', ['ci', '--ignore-scripts'], {
            cwd: absPath,
            env: { ...process.env, NODE_ENV: 'production' },
            stdio: ['pipe', 'pipe', 'pipe'], // Capture all streams
            shell: process.platform === 'win32'
        });

        let stdout = '';
        let stderr = '';

        // Capture output
        npmProcess.stdout?.on('data', (data) => {
            stdout += data.toString();
        });

        npmProcess.stderr?.on('data', (data) => {
            stderr += data.toString();
        });

        // Handle process spawn failure
        npmProcess.on('error', (err) => {
            resolve({
                success: false,
                stdout: '',
                stderr: '',
                error: `Failed to start npm ci: ${err.message}`
            });
        });

        // Enforce timeout
        const timeout = setTimeout(() => {
            npmProcess.kill(); // Sends SIGTERM
            resolve({
                success: false,
                stdout,
                stderr,
                error: `npm ci timed out after ${timeoutMs / 1000} seconds`
            });
        }, timeoutMs);

        // Handle normal exit
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
                    error: `npm ci failed with exit code ${code}. ${stderr || ''}`
                });
            }
        });
    });
};