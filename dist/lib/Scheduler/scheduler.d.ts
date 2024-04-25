import { CreateJobT, IJob } from "../../model/Job";
import { runJobs } from './runJobs';
import { SchedulerConfig } from "../../types";
/**
 * Writing all functions here so that no need for export from another file
 * and will be encapsulted
 * */
/** */
declare function connectDb(config: SchedulerConfig): Promise<boolean>;
/** */
declare function deleteJob(jobId: string): Promise<boolean>;
/** */
declare function rescheduleJob<T>(jobId: string, job: IJob<T>): Promise<IJob<T>>;
/** */
declare function scheduleJob<T>({ idempotentKey, type, params, runAt }: CreateJobT<T>): Promise<IJob<T>>;
export { connectDb as connectDb, deleteJob as deleteJob, rescheduleJob as rescheduleJob, runJobs as runJobs, scheduleJob as scheduleJob, };
//# sourceMappingURL=scheduler.d.ts.map