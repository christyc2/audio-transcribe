/**
 * Dashboard.tsx is the main component that renders the dashboard page.
 * It displays the user's profile, the upload form, and the list of jobs.
 */
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { fetchProfile } from '../api/auth';
import {fetchUserJobs, uploadJob, type UserJob} from '../api/jobs';
import { useAuth } from './AuthProvider';

// 5MB is the maximum file size for audio uploads
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobs, setJobs] = useState<UserJob[]>([]);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsVisible, setJobsVisible] = useState(false)
  const [polling, setPolling] = useState(true)
  const [showJobsButton, setShowJobsButton] = useState(true)

  useEffect(() => {
    // if user is not authenticated, fetch user profile from backend
    if (!user) {
      fetchProfile().then((profile) => setUser(profile)).catch(() => {
        // do nothing because the store already handles state errors
      });
    }
  }, [setUser, user]);

  // [loadJobs] fetches user jobs from the backend
  const loadJobs = async () => {
    setJobsLoading(true);
    setJobsError(null);
    if (!showJobsButton){setJobsVisible(true);}

    try {
      const data = await fetchUserJobs();
      setJobs(data);
      for (let job of jobs){
        if (job.status == "completed"){
          setPolling(false);
        }
        else if (job.status == "failed") {
          setPolling(false);
          setJobsError("Transcription failed")
        }
        else {
          setPolling(true);
        }
      }
    } catch (error) {
      setJobsError(error instanceof Error ? error.message : 'Unable to load jobs.')
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();

    if (!polling) return;

    const interval = window.setInterval(() => {
      loadJobs();
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  // [handleFileChange] adds the selected file to the state (but not yet uploaded)
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // check if file is too large before trying to upload
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError('File is too large. Please select a file smaller than 5MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // [handleUploadSubmit] handles the file upload submission
  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadError('Please choose an audio file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    // try to upload file to backend
    try {
      await uploadJob(selectedFile);
      setSelectedFile(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unable to upload file.')
    } finally {
      setIsUploading(false);
    }
  };

  // specify how to render the dashboard UI
  return (
    <div className="flex min-h-screen overflow-y-auto">
      <div className={`mx-auto w-full max-w-4xl px-4 py-10 text-white transition-all duration-300 ${jobsVisible ? 'w-1/2' : 'w-full'} overflow-auto`}>
        
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-slate-400">
            {user ? `Signed in as ${user.username}` : 'Fetching profile...'}
          </p>
          {user?.disabled ? (
            <p className="mt-2 text-sm text-amber-300">
              Your account is currently disabled.
            </p>
          ) : null}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-900/40">
          <h2 className="text-xl font-semibold">Upload audio</h2>
          <p className="mt-2 text-sm text-slate-400">
            Audio files only, up to 5MB.
          </p>
          <form
            onSubmit={handleUploadSubmit}
            className="mt-4 flex flex-col gap-4 rounded-xl border border-dashed border-slate-700 p-4"
          >
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-400"
              disabled={isUploading}
            />
            {selectedFile ? (
              <p className="text-xs text-slate-400">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            ) : null}
            {uploadError ? (
              <p className="text-sm text-red-400">{uploadError}</p>
            ) : null}
            <button
              type="submit"
              className="w-fit rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading…' : 'Upload file'}
            </button>
          </form>
        </section>
        <section className="mt-8">
      {showJobsButton && (
        <button
          type="button"
          onClick={() => {setShowJobsButton(false); setJobsVisible(true)}}
          className={`mx-auto flex w-1/2 items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-base font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          Show jobs
        </button>
      )}
      {!showJobsButton && (
        <button
          type="button"
          onClick={() => {setShowJobsButton(true); setJobsVisible(false)}}
          className={`mx-auto flex w-1/2 items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-base font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          Hide jobs
        </button>
      )}
      </section>
      </div>


      {/* Jobs section */}
      {jobsVisible && (
        <div className={`mx-auto w-full max-w-4xl px-4 py-10 text-white transition-all duration-300 ${
          jobsVisible ? 'w-1/2 opacity-100' : 'w-full opacity-0'
          }`}>
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your jobs</h2>
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
      )}
    </div>
  );
};
