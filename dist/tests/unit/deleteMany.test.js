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
const mongoose_1 = __importDefault(require("mongoose"));
const job_1 = require("../../data/job");
const Scheduler_1 = require("../../lib/Scheduler");
const Job_1 = require("../../model/Job");
const chai_1 = require("chai");
describe("Delete many jobs", () => {
    //
    let totalCountOfRecords;
    let firstRecord;
    let jobIds = [];
    before("Creating many jobs to delete", () => __awaiter(void 0, void 0, void 0, function* () {
        // Connecting to DB
        yield (0, Scheduler_1.connectDb)({
            mongoConfig: {
                connectionUrl: process.env.MONGODB_CONNECTION_URL || "",
            },
        });
        // Get total records before creation
        totalCountOfRecords = yield Job_1.Job.count();
        // get first record
        firstRecord = (yield Job_1.Job.find({}))[0];
        // Creating many jobs and setting their ids
        jobIds = yield createManyJobs();
    }));
    it("delete all jobs by ids", () => __awaiter(void 0, void 0, void 0, function* () {
        const { deletedCount } = yield (0, Scheduler_1.deleteAllPendingJobsByIds)(jobIds);
        chai_1.assert.strictEqual(deletedCount, jobIds.length);
    }));
    it("are specified jobs deleted", () => __awaiter(void 0, void 0, void 0, function* () {
        const jobs = yield Job_1.Job.find({ _id: { $in: jobIds } });
        chai_1.assert.equal(jobs.length, 0);
    }));
    it("does rest of record exist after deletion", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.assert.strictEqual(totalCountOfRecords, yield Job_1.Job.count());
    }));
    it("are other records untouched", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        chai_1.assert.strictEqual((_a = firstRecord._id) === null || _a === void 0 ? void 0 : _a.toString(), (yield Job_1.Job.find())[0]._id.toString());
    }));
});
/** */
function createManyJobs() {
    return __awaiter(this, void 0, void 0, function* () {
        // creating job array to insert
        const Jobs = Array(10)
            .fill(0)
            .map((_, index) => (Object.assign(Object.assign({}, job_1.JobData), { idempotentKey: new mongoose_1.default.Types.ObjectId().toString() })));
        // prepate promises for job scheduling
        const promises = Jobs.map(Scheduler_1.scheduleJob);
        // get job id from iJob
        const getJobId = (j) => (j === null || j === void 0 ? void 0 : j._id) ? j._id.toString() : null;
        //
        return (yield Promise.all(promises))
            .map(getJobId)
            .filter((id) => !!id);
    });
}
