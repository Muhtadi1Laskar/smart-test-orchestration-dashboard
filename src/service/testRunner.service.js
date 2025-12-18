import { spawn } from "child_process"
import path from "path"
import fs from 'fs/promises';
import os from 'os';

export const parsePlaywrightReport = (rawReport) => {
    const { suites, stats } = rawReport;

    const tests = [];
    const failedTests = [];

    function walkSuites(suite) {
        for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
                const result = test.results[0];
                const testEntry = {
                    title: spec.title,
                    suite: suite.title,
                    status: result.status,
                    duration: result.duration,
                    error: result.error?.message || null,
                    // Add artifact paths if needed:
                    screenshot: result.attachments?.find(a => a.name === 'screenshot')?.path || null,
                    trace: result.attachments?.find(a => a.name === 'trace')?.path || null
                };

                tests.push(testEntry);
                if (result.status === "failed") {
                    failedTests.push(testEntry);
                }
            }
        }
        for (const childSuite of suite.suites || []) {
            walkSuites(childSuite)
        }
    }

    for (const suite of suites) {
        walkSuites(suite);
    }

    return {
        status: failedTests.length === 0 ? 'passed' : 'failed',
        total: tests.length,
        passed: tests.filter(t => t.status === 'passed').length,
        failed: failedTests.length,
        duration: stats.duration,
        startTime: stats.startTime,
        tests,
        failedTests
    };
}

export const testRunner = async (baseTestDir, runId) => {
    // 1. Create isolated output dir for THIS run
    const outputDir = path.join(os.tmpdir(), `playwright-output-${runId}`);
    await fs.mkdir(outputDir, { recursive: true });

    // 2. Run Playwright from the ORIGINAL test dir (with browsers already installed)
    const proc = spawn('npx', [
        'playwright', 'test',
        '--reporter=json',
        `--output=${outputDir}` // ← critical: isolate results
    ], {
        cwd: baseTestDir, // ← fixed path to your real test suite
        env: {
            ...process.env,
            // Optional: disable video/trace if not needed to save space
            // PWVIDEO: 'off',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: process.platform === 'win32' // true on Windows
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            proc.kill();
        }, 10 * 60 * 1000); // 10 min max

        proc.on('close', async (code) => {
            clearTimeout(timeout);

            try {
                // const report = code === 0 ? JSON.parse(stdout) : null;
                const rawReportPath = path.join(outputDir, "raw-report.json");
                await fs.writeFile(rawReportPath, stdout);

                let summary = null;
                let report = null;

                if (code === 0) {
                    try {
                        report = JSON.parse(stdout);
                        summary = parsePlaywrightReport(report);

                        console.log("SUMMARY: ", summary);

                        const summaryPath = path.join(outputDir, 'summary.json');
                        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
                    } catch (error) {
                        console.error("Failed to parse playwright JSON report: ", error);
                        stderr += `\n[PARSER ERROR] ${error.message}`;
                    }
                } else {
                    report = JSON.parse(stdout);
                    summary = parsePlaywrightReport(report);
                }

                resolve({
                    success: code === 0 && summary !== null,
                    report,
                    stdout,
                    stderr,
                    outputDir, // so you can serve artifacts later,
                    summary,
                    rawReportPath,
                    error: code !== 0 ? stderr : null
                });
            } catch (e) {
                resolve({
                    success: false,
                    report: null,
                    summary: null,
                    stdout,
                    stderr,
                    outputDir,
                    error: e.message
                });
            }
        });
    });
}

