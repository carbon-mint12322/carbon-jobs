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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallApi = void 0;
const axios_1 = __importDefault(require("axios"));
/** */
function CallApi(jobId, params) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get platform, then uri from data.
        const { platform, data } = params;
        // Get domain based on platform
        const domain = getDomainByPlatform(platform);
        if (!domain)
            throw new Error('Domain not valid.');
        // Get headers based on platform
        const headers = getHeadersByPlatform(platform);
        if (!(headers === null || headers === void 0 ? void 0 : headers.scheduler_authorization))
            throw new Error('Auth token for platform not valid.');
        // Get uri and payload
        const _a = Object.assign(Object.assign({}, data), { jobId: jobId.toString() }), { uri } = _a, payload = __rest(_a, ["uri"]);
        if (!uri)
            throw new Error('URI not valid.');
        if (!payload)
            throw new Error('Payload not valid.');
        try {
            // Post to url with headers & data
            const response = yield axios_1.default.post(`${domain}/${uri}`, payload, { headers });
            return ([200, 201].includes(response.status));
        }
        catch (e) {
            if (e instanceof Error) {
                throw new Error(JSON.stringify({
                    message: e.message,
                    uri,
                    domain
                }));
            }
        }
        throw new Error("Call api failed.");
    });
}
exports.CallApi = CallApi;
/** */
function getDomainByPlatform(platform) {
    switch (platform) {
        case 'farmbook':
            return process.env.FARMBOOK_DOMAIN;
        // Rejecting on unsupported format
        default:
            throw new Error("Platform not supported");
    }
}
/** */
function getHeadersByPlatform(platform) {
    switch (platform) {
        case 'farmbook':
            return {
                'scheduler_authorization': process.env.FARMBOOK_SCHEDULER_AUTH_TOKEN
            };
        // Rejecting on unsupported format
        default:
            throw new Error("Platform not supported");
    }
}
