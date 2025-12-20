
import type { UserJob } from '../api/jobs';

type ResultProps = {
  job?: UserJob | null;
};

export const Result = ({ job }: ResultProps) => {
  const [jobs, setJobs] = useState<UserJob[]>([]);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsLoading, setJobsLoading] = useState(false);


  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-900/40">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your jobs</h2>
          <button
            onClick={loadJobs}
            className="text-sm font-semibold text-sky-400 transition hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={jobsLoading}
          >
            {jobsLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {jobsError ? (
          <p className="mt-4 text-sm text-red-400">{jobsError}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {jobs.map((job) => (
              <li
                key={job.job_id}
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold">{job.filename}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                    {job.status}
                  </span>
                </div>
                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Transcript
                  </p>
                  <p className="mt-2 text-sm text-slate-100">
                    {job.transcript ?? 'Transcription pending…'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!jobsError && !jobsLoading && jobs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            No jobs yet. Upload an audio file to get started.
          </p>
        ) : null}
      </section>
    </div>
  );
};
