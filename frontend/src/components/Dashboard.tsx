/**
 * Dashboard.tsx is the main component that renders the dashboard page.
 * It displays the user's profile, the upload form, and the list of jobs.
 */
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { fetchProfile } from '../api/auth';
import {fetchUserJobs, uploadJob, type UserJob} from '../api/jobs';
import { useAuth } from './AuthProvider';
import {Blockquote, ScrollArea} from "@radix-ui/themes";

// 5MB is the maximum file size for audio uploads
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Calculate scroll area height based on transcript length
const calculateTranscriptHeight = (transcript: string | null | undefined): number => {
  if (!transcript || transcript.trim().length === 0) {
    return 40; // Minimum height for empty transcript
  }
  
  // Base height + proportional height based on character count
  // Roughly 1px per 3 characters, with min 60px and max 300px
  const baseHeight = 40;
  const charCount = transcript.length;
  const proportionalHeight = Math.floor(charCount / 3);
  const totalHeight = baseHeight + proportionalHeight;
  
  // Clamp between min and max
  return Math.min(Math.max(totalHeight, 40), 300);
};

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
        
        <section className="rounded-2xl border border-rose-300/30 bg-rose-200/10 p-8 shadow-xl shadow-rose-300/20">
          <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-neutral-400">
            {user ? (
              <>
                Signed in as <span className="text-rose-300 font-medium">{user.username}</span>
              </>
            ) : (
              'Fetching profile...'
            )}
          </p>
          {user?.disabled ? (
            <p className="mt-2 text-sm text-red-400">
              Your account is currently disabled.
            </p>
          ) : null}
        </section>

        <section className="mt-8 rounded-2xl border border-rose-300/30 bg-rose-200/10 p-6 shadow-xl shadow-rose-300/20">
          <h2 className="text-xl font-semibold text-white">Upload audio</h2>
          <p className="mt-2 text-sm text-neutral-400">
          Audio files only (MAX. 5MB)
          </p>
          <form
            onSubmit={handleUploadSubmit}
            className="mt-4 flex flex-col gap-4"
          >
            <div className="group/upload relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-300/40 bg-rose-200/10 p-8 transition-all duration-300 hover:border-rose-500/50 hover:bg-rose-200/20">
              <div className="flex flex-col items-center text-center">
                <svg className="mb-4 h-12 w-12 text-rose-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="mb-2 text-sm font-medium text-neutral-300">
                  <span className="text-rose-400">Click to upload</span> or drag and drop
                </p>
              </div>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                disabled={isUploading}
              />
            </div>
            
            {selectedFile ? (
              <div className="rounded-lg border border-rose-300/30 bg-rose-200/10 px-4 py-3">
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                    <p className="text-xs text-neutral-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            ) : null}
            {uploadError ? (
              <p className="text-sm text-red-400">{uploadError}</p>
            ) : null}
            <button
              type="submit"
              className="w-fit rounded-md bg-rose-300 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="group flex items-center space-x-2 mx-auto w-1/2 justify-center rounded-lg border border-rose-300 bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-sm transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700"
            >
              <span>View All Jobs</span>
              <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {!showJobsButton && (
            <button
              type="button"
              onClick={() => {setShowJobsButton(true); setJobsVisible(false)}}
              className="group flex items-center space-x-2 mx-auto w-1/2 justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-600 shadow-sm transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
            >
              <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Hide Jobs</span>
            </button>
          )}
        </section>
      </div>


      {/* Jobs section */}
      {jobsVisible && (
        <div className={`mx-auto w-full max-w-4xl px-4 py-10 text-white transition-all duration-300 ${
          jobsVisible ? 'w-1/2 opacity-100' : 'w-full opacity-0'
          }`}>
          <section className="rounded-2xl border border-rose-300/30 bg-rose-300/20 p-8 shadow-xl shadow-rose-300/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Your jobs</h2>
          </div>
          {jobsError ? (
            <p className="mt-4 text-sm text-red-400">{jobsError}</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {jobs.map((job) => (
                <li
                  key={job.job_id}
                  className="rounded-xl border border-rose-300/30 bg-rose-200/15 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-white">{job.filename}</p>
                    </div>
                    <span className="rounded-full border border-rose-400/50 bg-rose-400/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-4 rounded-lg border border-rose-300/30 bg-rose-200/10 p-3">
                    <p className="text-xs font-semibold uppercase text-rose-300">
                      Transcript
                    </p>
                    <ScrollArea type="always" scrollbars="vertical" style={{ height: calculateTranscriptHeight(job.transcript) }}>
                          <Blockquote className="mt-2 text-sm text-white border-rose-300/30 p-3">
                          {job.transcript}
                          </Blockquote>
                    </ScrollArea>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!jobsError && !jobsLoading && jobs.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-400">
              No jobs yet. Upload an audio file to get started.
            </p>
          ) : null}
        </section>
        </div>
      )}
    </div>
  );
};
