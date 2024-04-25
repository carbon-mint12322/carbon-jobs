"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailJobData = void 0;
const Utils_1 = require("../helper/Utils");
// This is supposed to fail after retrying
const FailJobData = {
    "type": "API_CALL",
    "idempotentKey": "2",
    "params": {
        "platform": "farmbook",
        "data": {
            "uri": "non_existent",
            "name": "manoj"
        }
    },
    "runAt": (0, Utils_1.getISOTimestamp)((0, Utils_1.getSecondsAddedToUnixTime)(10)) // Adding 10 seconds to current time
};
exports.FailJobData = FailJobData;
