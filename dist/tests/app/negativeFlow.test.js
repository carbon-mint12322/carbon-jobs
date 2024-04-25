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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const assert_1 = __importDefault(require("assert"));
const job_fail_1 = require("../../data/job.fail");
const Utils_1 = require("../../helper/Utils");
const Scheduler_1 = require("../../lib/Scheduler");
const Job_1 = require("../../model/Job");
describe('Negative Flow: Schedule Lib test', () => {
    let createdJobForCron;
    before('Deleting a job by idempotent key to enable faster retesting', () => __awaiter(void 0, void 0, void 0, function* () {
        // Connecting to DB
        yield (0, Scheduler_1.connectDb)({
            mongoConfig: {
                connectionUrl: process.env.MONGODB_CONNECTION_URL || ''
            }
        });
        try {
            // Clearing existing record for testing
            const job = yield Job_1.Job.findOne({ idempotentKey: job_fail_1.FailJobData.idempotentKey });
            if (!job)
                return;
            yield Job_1.Job.deleteOne({ _id: job.id });
        }
        catch (e) {
            console.error(e);
        }
    }));
    it('Create a new job for running cron', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            createdJobForCron = yield (0, Scheduler_1.scheduleJob)({
                idempotentKey: job_fail_1.FailJobData.idempotentKey,
                params: job_fail_1.FailJobData.params,
                runAt: job_fail_1.FailJobData.runAt,
                type: job_fail_1.FailJobData.type
            });
            // console.log(getISOTimestamp(getUnixTime()) + ": Job creation")
            // console.log(JobJson.runAt + ": Job supposed to run At")
        }
        catch (e) {
            console.error(e);
        }
        return assert_1.default.equal((createdJobForCron &&
            (createdJobForCron === null || createdJobForCron === void 0 ? void 0 : createdJobForCron._id) &&
            ((_a = createdJobForCron === null || createdJobForCron === void 0 ? void 0 : createdJobForCron._id) === null || _a === void 0 ? void 0 : _a.toString().length) > 0), true);
    }));
    it('Running cron & checking if nextRetryTime is properly sscheduled', () => __awaiter(void 0, void 0, void 0, function* () {
        let isCronRun = false;
        // This value is used to check if isCronRun value can be updated 
        // or if retry values can be checked
        let canUpdateCronRes = true;
        try {
            if (!createdJobForCron)
                return;
            const retrySeconds = parseInt(process.env.JOB_RETRY_AFTER_SECONDS || '1');
            const runTill = (0, Utils_1.getSecondsAddedToSpecifiedUnixTime)((0, Utils_1.getUnixTime)(createdJobForCron.runAt), retrySeconds * 6);
            const findJob = () => __awaiter(void 0, void 0, void 0, function* () {
                const jobRow = yield Job_1.Job.findById(createdJobForCron._id);
                if (!jobRow)
                    throw new Error('Job not found');
                return jobRow;
            });
            // Storing states
            let prevRetryCount = 0;
            const runningTimestamps = [];
            const getAllRunningTimestampChanges = () => __awaiter(void 0, void 0, void 0, function* () {
                const jobRow = yield findJob();
                // Settign retry count if changed
                if (jobRow.retriedCount > prevRetryCount) {
                    prevRetryCount = jobRow.retriedCount;
                    runningTimestamps.push(jobRow.nextRetryAt);
                }
            });
            // Run till time reaches 5 seconds after the job is supposed to run
            while ((0, Utils_1.getUnixTime)() <= runTill) {
                yield (0, Scheduler_1.runJobs)(10);
                yield getAllRunningTimestampChanges();
                yield (0, Utils_1.sleepTill)();
            }
            const validatingRetryTimes = (arr) => {
                const isAllDate = arr.every(Utils_1.isIsoDate);
                if (!isAllDate)
                    return false;
                let prevTime = new Date(arr[0]).getTime() / 1000;
                let iter = 1;
                let res = [];
                while (iter < arr.length) {
                    const currTime = new Date(arr[iter]).getTime() / 1000;
                    res.push((currTime - prevTime) > retrySeconds);
                    prevTime = currTime;
                    iter++;
                }
                return res.every(r => r === true);
            };
            // console.log({runningTimestamps});
            isCronRun = validatingRetryTimes(runningTimestamps);
        }
        catch (e) {
            console.error(e);
        }
        return assert_1.default.equal(isCronRun, true);
    }));
    it('Checking if job failed, after retrying 5 times', () => __awaiter(void 0, void 0, void 0, function* () {
        let isJobFailed;
        try {
            if (!createdJobForCron)
                return;
            const job = yield Job_1.Job.findById(createdJobForCron._id);
            if (!(job === null || job === void 0 ? void 0 : job._id))
                throw new Error('Job not found for test.');
            isJobFailed = (job.failedAt !== null
                && job.completedAt === null
                && job.retriedCount >= 4
                && job.nextRetryAt !== null);
        }
        catch (e) {
            console.error(e);
        }
        return assert_1.default.equal(isJobFailed, true);
    }));
    after('Deleting job after test', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Job_1.Job.deleteOne({ _id: createdJobForCron._id });
        console.log("Deleted Job.");
        return true;
    }));
});
