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