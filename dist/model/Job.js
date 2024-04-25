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
exports.Job = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const getTablePrefix_1 = require("../lib/getTablePrefix");
const JobHistory_1 = require("./JobHistory");
const JobParamsSchema = new mongoose_1.default.Schema({
    // Platform from which the request from (eg,. farmbook, farmfit, evlocker etc,.)
    platform: {
        required: true,
        type: String
    },
    data: {
        required: true,
        type: Object
    }
});
const JobSchema = new mongoose_1.default.Schema({
    // A key that is provided by the caller for making the job only run one time ever
    idempotentKey: {
        type: String,
        required: true,
        unique: true
    },
    // Type of the job eg,. API_CALL, NOTIFICATION etc
    type: {
        type: String,
        required: true,
    },
    // Params to pass to the job handler when the time comes
    params: JobParamsSchema,
    // Time to run the job at
    runAt: {
        type: String,
        required: true,
    },
    // Time which the job was completed
    completedAt: {
        type: String,
        default: null
    },
    // Time the job was retried 
    retriedCount: {
        type: Number,
        default: 0
    },
    // Time in which the job should be retried next on
    nextRetryAt: {
        type: String,
        default: null
    },
    // Time on which the job failed and will never be retied again
    failedAt: {
        type: String,
        default: null
    },
}, {
    // Time at which the job was created and when the job record was udpated
    timestamps: true,
    collection: `${(0, getTablePrefix_1.getTablePrefix)()}/jobs`
});
/** To ensure than when a job is deleted, jobHistory is also deleted */
JobSchema.pre('deleteOne', { query: true, document: false }, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Find job and get idempotent key
        const job = yield exports.Job.findById(this.getQuery());
        if (!(job === null || job === void 0 ? void 0 : job._id))
            throw new Error("Job not found.");
        // Deleting job history if job is being deleted
        yield JobHistory_1.JobHistory.deleteOne({ jobIdempotentKey: job.idempotentKey });
        next();
    });
});
exports.Job = mongoose_1.default.model('Job', JobSchema);
