"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobData = void 0;
const Utils_1 = require("../helper/Utils");
const JobData = {
    "type": "API_CALL",
    "idempotentKey": "6481b49121e542c7bf591412.6481b49121e542c7bf591412.6481b49121e542c7bf591412.6481b49121e542c7bf591412",
    "params": {
        "platform": "farmbook",
        "data": {
            "uri": "/api/farmbook/kadavur-organic-farmers/plan/notify",
            "planId": '6481b49121e542c7bf591412',
            "eventPlanId": "6481b49121e542c7bf591410",
            "operatorId": '637de381c57f7f5cf96fc367'
        }
    },
    "runAt": (0, Utils_1.getISOTimestamp)((0, Utils_1.getSecondsAddedToUnixTime)(10)) // Adding 10 seconds to current time
};
exports.JobData = JobData;
