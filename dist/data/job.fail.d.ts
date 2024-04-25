declare const FailJobData: {
    type: string;
    idempotentKey: string;
    params: {
        platform: string;
        data: {
            uri: string;
            name: string;
        };
    };
    runAt: string;
};
export { FailJobData };
//# sourceMappingURL=job.fail.d.ts.map