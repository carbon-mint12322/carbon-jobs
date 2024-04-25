import { JobParams } from "./model/Job";
export type SchedulerConfig = {
    mongoConfig: {
        connectionUrl: string;
    };
};
export type JobHandlerCallback = <T = any>(jobId: string, params: JobParams<T>) => Promise<boolean>;
//# sourceMappingURL=types.d.ts.map