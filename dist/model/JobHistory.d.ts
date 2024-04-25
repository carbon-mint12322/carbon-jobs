import Mongoose, { Types } from "mongoose";
export interface IJobHistory {
    jobIdempotentKey: Types.ObjectId;
    createdAt: string;
}
export declare const JobHistory: Mongoose.Model<IJobHistory, {}, {}, {}, any>;
//# sourceMappingURL=JobHistory.d.ts.map