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
exports.isIsoDate = exports.sleepTill = exports.checkIfDbConnectedOrThrowError = exports.getISOTimestamp = exports.secondsToMilliseconds = exports.getSecondsAddedToSpecifiedUnixTime = exports.getSecondsAddedToUnixTime = exports.getUnixTimeInSeconds = exports.getUnixTime = void 0;
function getUnixTime(isoString) {
    return isoString
        ? new Date(isoString).getTime()
        : new Date().getTime();
}
exports.getUnixTime = getUnixTime;
function getUnixTimeInSeconds(isoString) {
    return Math.floor((isoString ? getUnixTime(isoString) : getUnixTime()) / 1000);
}
exports.getUnixTimeInSeconds = getUnixTimeInSeconds;
function getSecondsAddedToUnixTime(seconds = 0) {
    return getUnixTime() + secondsToMilliseconds(seconds);
}
exports.getSecondsAddedToUnixTime = getSecondsAddedToUnixTime;
function getSecondsAddedToSpecifiedUnixTime(unixTime, seconds = 0) {
    return unixTime + secondsToMilliseconds(seconds);
}
exports.getSecondsAddedToSpecifiedUnixTime = getSecondsAddedToSpecifiedUnixTime;
function secondsToMilliseconds(seconds = 0) {
    return 1000 * seconds;
}
exports.secondsToMilliseconds = secondsToMilliseconds;
function getISOTimestamp(unix) {
    return unix ? (new Date(unix)).toISOString() : (new Date()).toISOString();
}
exports.getISOTimestamp = getISOTimestamp;
function checkIfDbConnectedOrThrowError() {
    if (process.env['SCHEDULER_MONGOOSE_CONNECTION'] === '1')
        return;
    throw new Error("Db connection not established. Please call `connectDb` first");
}
exports.checkIfDbConnectedOrThrowError = checkIfDbConnectedOrThrowError;
/** */
function sleepTill(seconds = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => setTimeout(() => resolve(true), seconds * 1000));
    });
}
exports.sleepTill = sleepTill;
/** */
function isIsoDate(str) {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str))
        return false;
    const d = new Date(str);
    return d instanceof Date && !isNaN(d) && d.toISOString() === str; // valid date 
}
exports.isIsoDate = isIsoDate;
