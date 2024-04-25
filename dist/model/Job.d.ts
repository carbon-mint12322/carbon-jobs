import Mongoose from "mongoose";
export interface JobParams<T> {
    platform: string;
    data: T;
}
export interface IJob<T> {
    _id?: string;
    idempotentKey: string;
    type: string;
    params: JobParams<T>;
    runAt: string;
    completedAt: string | null;
    retriedCount: number;
    nextRetryAt: string | null;
    failedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateJobT<T> = Pick<IJob<T>, "idempotentKey" | "type" | "params" | "runAt">;
export declare const Job: Mongoose.Model<IJob<any>, {}, {}, {}, any>;
//# sourceMappingURL=Job.d.ts.map