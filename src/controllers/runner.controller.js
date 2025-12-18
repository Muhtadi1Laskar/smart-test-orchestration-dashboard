import { testRunner } from "../service/testRunner.service.js";

export const runTestController = async (req, res, next) => {
    const { testSuitePath } = req.body;

    try {
        await testRunner(testSuitePath);
        res.status(200).json({ message: "Successfull Ran the test" })
    } catch (error) {
        next(error);
    }
}