export function JobStatusModal({ job }: { job: any }) {
  if (!job) return null;
  return <div className="card mt-4">Status: {job.status} ({job.progress}%) {job.result_url && <a className="underline ml-2" href={job.result_url}>baixar</a>}</div>;
}
