"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJobs = void 0;
const Utils_1 = require("../../helper/Utils");
const Job_1 = require("../../model/Job");
const JobHistory_1 = require("../../model/JobHistory");
const CallApi_1 = require("./CallApi");
/** */
function runJobs(jobLimit) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, Utils_1.checkIfDbConnectedOrThrowError)();
        return handleJobs(jobLimit);
    });
}
exports.runJobs = runJobs;
/** */
function handleJobs(jobLimit) {
    return __awaiter(this, void 0, void 0, function* () {
        const jobs = yield fetchValidJobs(jobLimit);
        // Run all jobs in async manner
        return runJobsAsync(jobs);
    });
}
/** */
function fetchValidJobs(jobLimit) {
    return __awaiter(this, void 0, void 0, function* () {
        jobLimit = parseInt(jobLimit + "") || 10;
        return Job_1.Job
            .find({
            retriedCount: { $lt: 5 },
            runAt: { $lt: (0, Utils_1.getISOTimestamp)() },
            completedAt: null,
            $or: [
                { nextRetryAt: { $lt: (0, Utils_1.getISOTimestamp)() } },
                { nextRetryAt: null },
            ]
        })
            .sort({ runAt: 'asc' })
            .limit(jobLimit);
    });
}
/** */
function runJobsAsync(jobs) {
    return __awaiter(this, void 0, void 0, function* () {
        // Promises holder
        const promises = [];
        if (!((jobs === null || jobs === void 0 ? void 0 : jobs.length) > 0))
            return 'no_more_job';
        jobs.forEach(job => {
            promises.push(handleEachJob(job));
        });
        const res = yield Promise.all(promises);
        return res.every(r => r === true);
    });
}
/** */
function handleEachJob(job) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { _id: jobId, idempotentKey } = job;
            if (!jobId)
                throw new Error("Id not valid in doc.");
            if (!idempotentKey)
                throw new Error("idempotentKey not valid in doc.");
            // Try running job and return true if successfull
            if (yield tryJob(jobId, job))
                return true;
            // Reached here means task run failed, Retry logic should be run
            yield setJobForRetry(jobId, job);
            return false;
        }
        catch (e) {
            console.error(e);
        }
        return false;
    });
}
/** */
function tryJob(jobId, job) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create a job history (will throw error if trying to create a duplicate)
            yield JobHistory_1.JobHistory.create({
                jobIdempotentKey: job.idempotentKey,
                createdAt: (0, Utils_1.getISOTimestamp)()
            });
            // Get job type, call the handler function and pass the job params to it
            // Will either succeed or throw error
            yield getJobHandler(job.type)(jobId, job.params);
            // reaching this point means, job history created & job handler run sucessfully
            yield setJobAsCompleted(jobId);
            return true;
        }
        catch (e) {
            (e instanceof Error) && console.error(e.message);
        }
        return false;
    });
}
/** TODO : Move handlers to another file where we can register */
function getJobHandler(type) {
    switch (type) {
        case 'API_CALL':
            return CallApi_1.CallApi;
        // Rejecting unsupported type
        default:
            throw new Error('No handler for job type.');
    }
}
/** */
function setJobForRetry(jobId, job) {
    return __awaiter(this, void 0, void 0, function* () {
        const DEFAULT_RETRY_SECONDS = 5 * 60; // 5 minutes
        const RETRY_SECONDS = parseInt(process.env.JOB_RETRY_AFTER_SECONDS
            || DEFAULT_RETRY_SECONDS.toString());
        // If job retried count is less than or equal to 4, set as failed and return
        if (job.retriedCount >= 4)
            setJobAsFailed(jobId);
        // If job retried count is less than 5
        // Increment the retryCount, increase the retryNextAt 5 minutes from now and update
        yield Job_1.Job.findByIdAndUpdate(jobId, {
            retriedCount: job.retriedCount + 1,
            nextRetryAt: (0, Utils_1.getISOTimestamp)((0, Utils_1.getSecondsAddedToUnixTime)(RETRY_SECONDS)) // Adding 5 minutes  
        });
        // Delete the jobHistory item by jobId
        yield JobHistory_1.JobHistory.deleteOne({ jobIdempotentKey: job.idempotentKey });
        return true;
    });
}
/** */
function setJobAsFailed(jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Job_1.Job.findByIdAndUpdate(jobId, {
            failedAt: (0, Utils_1.getISOTimestamp)(),
            retriedCount: 5
        });
    });
}
/** */
function setJobAsCompleted(jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Set completedAt as current unix time and return true
        yield Job_1.Job.findByIdAndUpdate(jobId, { completedAt: (0, Utils_1.getISOTimestamp)() });
        return true;
    });
}
