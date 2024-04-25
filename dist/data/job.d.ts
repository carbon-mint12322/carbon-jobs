declare const JobData: {
    type: string;
    idempotentKey: string;
    params: {
        platform: string;
        data: {
            uri: string;
            planId: string;
            eventPlanId: string;
            operatorId: string;
        };
    };
    runAt: string;
};
export { JobData };
//# sourceMappingURL=job.d.ts.map