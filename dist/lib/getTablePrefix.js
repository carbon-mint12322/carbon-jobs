"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTablePrefix = void 0;
function getTablePrefix() {
    return `/${getTenantName()}/${getAppName()}`;
}
exports.getTablePrefix = getTablePrefix;
function getTenantName() {
    return process.env.TENANT_NAME || "TENANT";
}
function getAppName() {
    return process.env.APP_NAME || "APP";
}
