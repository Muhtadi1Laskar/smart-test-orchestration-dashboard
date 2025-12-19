import path from "path";
import { testRunner } from "../service/testRunner.service.js";
import { cloneGithubRepo, installModules } from "../utils/githubClone.js";

export const runTestController = async (req, res, next) => {
    const runId = 'run_' + Date.now();
    const cloneRepo = await cloneGithubRepo("https://github.com/Muhtadi1Laskar/Proof-Of-Existence.git", runId);
    const installPackages = await installModules(cloneRepo);

    console.log(installPackages);
    console.log(cloneRepo);
    const { testSuitePath } = req.body;

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