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
const job_1 = require("../../data/job");
const Utils_1 = require("../../helper/Utils");
const Scheduler_1 = require("../../lib/Scheduler");
const Job_1 = require("../../model/Job");
describe('Postive Flow: Schedule Lib test', () => {
    let createdJob;
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
            const job = yield Job_1.Job.findOne({ idempotentKey: job_1.JobData.idempotentKey });
            if (!job)
                return;
            yield Job_1.Job.deleteOne({ _id: job.id });
        }
        catch (e) {
            console.error(e);
        }
    }));
    it('Create a new job', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            createdJob = yield (0, Scheduler_1.scheduleJob)({
                idempotentKey: job_1.JobData.idempotentKey,
                params: job_1.JobData.params,
                runAt: job_1.JobData.runAt,
                type: job_1.JobData.type
            });
        }
        catch (e) {
            console.error(e);
        }
        return assert_1.default.equal((createdJob &&
            (createdJob === null || createdJob === void 0 ? void 0 : createdJob._id) &&
            ((_a = createdJob === null || createdJob === void 0 ? void 0 : createdJob._id) === null || _a === void 0 ? void 0 : _a.toString().length) > 0), true);
    }));
    it('Fetch the new job', () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        let job = null;
        try {
            job = yield (0, Scheduler_1.getJobById)(createdJob._id);
        }
        catch (e) {
            console.error(e);
        }
        return assert_1.default.equal((job &&
            ((_b = job._id) === null || _b === void 0 ? void 0 : _b.toString()) === ((_c = createdJob === null || createdJob === void 0 ? void 0 : createdJob._id) === null || _c === void 0 ? void 0 : _c.toString())), true);
    }));
    it('Delete a job', () => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        let isDeleted = false;
        try {
            if (createdJob &&
                (createdJob === null || createdJob === void 0 ? void 0 : createdJob._id) &&
                ((_d = createdJob === null || createdJob === void 0 ? void 0 : createdJob._id) === null || _d === void 0 ? void 0 : _d.toString().length) > 0) {
                isDeleted = yield (0, Scheduler_1.deleteJob)(createdJob._id.toString());
            }
        }
        catch (e) {
            console.error(e);
        }
        return assert_1.default.equal(isDeleted, true);
    }));
    it('Create a new job for running cron', () => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        try {
            createdJobForCron = yield (0, Scheduler_1.scheduleJob)({
                idempotentKey: job_1.JobData.idempotentKey,
                params: job_1.JobData.params,
                runAt: job_1.JobData.runAt,
                type: job_1.JobData.type
            });
            // console.log(getISOTimestamp(getUnixTime()) + ": Job creation")
            // console.log(JobJson.runAt + ": Job supposed to run At")
        }
        catch (e) {
            console.error(e);
        }
        return assert_1.default.equal((createdJobForCron &&
            (createdJobForCron === null || createdJobForCron === void 0 ? void 0 : createdJobForCron._id) &&
            ((_e = createdJobForCron === null || createdJobForCron === void 0 ? void 0 : createdJobForCron._id) === null || _e === void 0 ? void 0 : _e.toString().length) > 0), true);
    }));
    it('Running cron for testing', () => __awaiter(void 0, void 0, void 0, function* () {
        let isCronRun = false;
        try {
            if (!createdJobForCron)
                return;
            const runTill = (0, Utils_1.getSecondsAddedToUnixTime)(20);
            // Run till time reaches expected time
            while ((0, Utils_1.getUnixTime)() <= runTill) {
                yield (0, Scheduler_1.runJobs)(10);
                yield (0, Utils_1.sleepTill)();
            }
            // Setting cron run true, if cron runs full loop without error
            isCronRun = true;
        }
        catch (e) {
            console.error(e);
        }
        return assert_1.default.equal(isCronRun, true);
    }));
    it('Checking if job started on time it was supposed to `runAt`', () => __awaiter(void 0, void 0, void 0, function* () {
        let isJobCompletedOnSpecificTime;
        try {
            if (!createdJobForCron)
                return;
            const job = yield Job_1.Job.findById(createdJobForCron._id);
            if (!((job === null || job === void 0 ? void 0 : job._id) && job.completedAt))
                throw new Error('Job not found for test.');
            isJobCompletedOnSpecificTime = ((0, Utils_1.getUnixTime)(job.completedAt) >= (0, Utils_1.getUnixTime)(job_1.JobData.runAt));
        }
        catch (e) {
            console.error(e);
        }
        return assert_1.default.equal(isJobCompletedOnSpecificTime, true);
    }));
    after('Deleting job after test', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Job_1.Job.deleteOne({ _id: createdJobForCron._id });
        console.log("Deleted Job.");
        return true;
    }));
});
