"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobHistory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Utils_1 = require("../helper/Utils");
const getTablePrefix_1 = require("../lib/getTablePrefix");
const JobHistorySchema = new mongoose_1.default.Schema({
    // the objectId of the job, to maintain the job running 
    // only one time even if it's invocated parallely
    jobIdempotentKey: {
        type: String,
        required: true,
        unique: true
    },
    // timestamps at which the event was created 
    createdAt: {
        type: String,
        default: Utils_1.getISOTimestamp
    },
}, {
    collection: `${(0, getTablePrefix_1.getTablePrefix)()}/jobHistories`
});
exports.JobHistory = mongoose_1.default.model('JobHistory', JobHistorySchema);
