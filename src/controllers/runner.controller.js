import path from "path";
import { testRunner } from "../service/testRunner.service.js";
import { cloneGithubRepo, installModules } from "../utils/githubClone.js";

export const runTestController = async (req, res, next) => {
    const { githubRepo } = req.body;

    if (!githubRepo || githubRepo.length === 0) {
        res.status(500).json({
            message: "Please provide a Github repo"
        });
    }

    const runId = 'run_' + Date.now();
    const cloneRepo = await cloneGithubRepo(githubRepo, runId);
    const installPackages = await installModules(cloneRepo);

    console.log(installPackages);
    console.log(cloneRepo);

    try {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked'
        });
        const result = await testRunner(cloneRepo, runId);

        res.end(JSON.stringify({
            runId: runId,
            status: result.success ? 'passed' : 'failed',
            summary: result.summary
        }));
    } catch (error) {
        next(error);
    }
}