import path from "path";
import { testRunner } from "../service/testRunner.service.js";

export const runTestController = async (req, res, next) => {
    const { testSuitePath } = req.body;
    const runId = 'run_' + Date.now();

    console.log(testSuitePath);
    try {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked'
        });
        const result = await testRunner(testSuitePath, runId);

        res.end(JSON.stringify({
            runId: runId,
            status: result.success ? 'passed' : 'failed',
            summary: result.summary
        }));
    } catch (error) {
        next(error);
    }
}