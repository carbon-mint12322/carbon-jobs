"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.scheduleJob = exports.runJobs = exports.rescheduleJob = exports.deleteJob = exports.connectDb = void 0;
require('dotenv').config();
const mongoose_1 = __importStar(require("mongoose"));
const Utils_1 = require("../../helper/Utils");
const Job_1 = require("../../model/Job");
const runJobs_1 = require("./runJobs");
Object.defineProperty(exports, "runJobs", { enumerable: true, get: function () { return runJobs_1.runJobs; } });
/**
 * Writing all functions here so that no need for export from another file
 * and will be encapsulted
 * */
/** */
function connectDb(config) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // Setup mongoose instance or throw error if not available in config
        if (!((_a = config === null || config === void 0 ? void 0 : config.mongoConfig) === null || _a === void 0 ? void 0 : _a.connectionUrl))
            throw new Error("Connection url not valid.");
        // If connection already set, return 
        if (process.env['SCHEDULER_MONGOOSE_CONNECTION'] === '1')
            return true;
        mongoose_1.default.set('strictQuery', true);
        yield (0, mongoose_1.connect)(config.mongoConfig.connectionUrl, { maxPoolSize: getMongooseMaxPoolSize() });
        // Set as connected in env variables for global access
        process.env['SCHEDULER_MONGOOSE_CONNECTION'] = '1';
        return true;
    });
}
exports.connectDb = connectDb;
/** */
function getMongooseMaxPoolSize() {
    var _a;
    return parseInt((_a = process.env.MAX_MONGOOSE_POOL_SIZE) !== null && _a !== void 0 ? _a : '10');
}
/** */
function deleteJob(jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!jobId)
            throw new Error("Job id not valid");
        (0, Utils_1.checkIfDbConnectedOrThrowError)();
        // Delete a job if exists or throw new error saying job does not exist
        /** Note: Triggers `deleteOne` to delete referenced JobHistory item also (Only when used _id for deletion) */
        const { deletedCount } = yield Job_1.Job.deleteOne({ _id: jobId });
        if (deletedCount === 1) {
            return true;
        }
        throw new Error('Job does not exist.');
    });
}
exports.deleteJob = deleteJob;
/** */
function rescheduleJob(jobId, job) {
    return __awaiter(this, void 0, void 0, function* () {
        yield deleteJob(jobId);
        return scheduleJob(job);
    });
}
exports.rescheduleJob = rescheduleJob;
/** */
function scheduleJob({ idempotentKey, type, params, runAt }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!type || !(typeof params === 'object') || !idempotentKey || !runAt) {
            throw new Error("Schedule job params not valid");
        }
        (0, Utils_1.checkIfDbConnectedOrThrowError)();
        // Create new job record or throw job not created error
        return Job_1.Job.create({ idempotentKey, type, params, runAt });
    });
}
exports.scheduleJob = scheduleJob;
