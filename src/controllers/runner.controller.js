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
    if(!cloneRepo.success) {
        return res.status(400).json({ error: cloneRepo.error });
    }

    const installPackages = await installModules(cloneRepo.outputDir);
    if (!installPackages.success) {
        return res.status(400).json({ error: installPackages.error });
    }

    try {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        const result = await testRunner(cloneRepo.outputDir, runId);

        res.end(JSON.stringify({
            runId: runId,
            status: result.success ? 'passed' : 'failed',
            summary: result.summary
        }));
    } catch (error) {
        next(error);
    }
}