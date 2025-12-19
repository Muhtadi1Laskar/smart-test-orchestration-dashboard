export const parsePlaywrightReport = (rawReport) => {
    const { suites, stats } = rawReport;

    const citeria = {
        passed: [],
        failed: [],
        skipped: [],
        timedOut: []
    };

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
                    screenshot: result.attachments?.find(a => a.name === 'screenshot')?.path || null,
                    trace: result.attachments?.find(a => a.name === 'trace')?.path || null
                };

                citeria[result.status].push(testEntry);
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
        status: citeria.failed.length === 0 ? 'passed' : 'failed',
        total: citeria.passed.length + citeria.failed.length + citeria.skipped.length + citeria.timedOut.length,
        passed: citeria.passed.filter(t => t.status === 'passed').length,
        failed: citeria.failed.length,
        skipped: citeria.skipped.length,
        timedOut: citeria.timedOut.length,
        duration: stats.duration,
        startTime: stats.startTime,
        passedTests: citeria.passed,
        failedTests: citeria?.failed || null,
        skippedTests: citeria?.skipped || null,
        timedOutTests: citeria?.timedOut || null
    };
}