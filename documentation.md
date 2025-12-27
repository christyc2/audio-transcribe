# Project Documentation

## Project Overview
This will be a fullstack audio transcription software(?).

Core features:
- User registration, login/authentication, and JWT authorization.

Tech stack:
- FastAPI backend
- React/Vite/Tailwindcss frontend
- Asynchronous task scheduling with Celery and Redis

System Architecture (what is this?)
- [how the frontend talks to the backend -- frontend uses Axios instance to make HTTP requests to backend]
- [Request/response lifecycle diagram description, including auth token flow -- what does this look like]

## FastAPI Backend
1. Application Bootstrap (`api/main.py`)
    - Creates a FastAPI app instance
    - Registers the routers
    - Attaches the middleware so every request passes through the authentication layer 

2. Data Models & Storage (`schemas.py`, `storage.py`)
    - Pydantic models defining data types and structures for tokens, users, and jobs
    - (Currently uses) in-memory user store structure (dictionary)
    - Helper functions `get_user`, `create_user`, and `user_exists` to prevent access to the in-memory database
    
3. Authentication Layer (`auth.py`, `middleware.py`)
    - Password hashing/verification 
    - Authenticates user login credentials
    - JWT (access token) creation and validation (encode/decode with secret key)
    - Check if a user is active (no need to login & has access to protected api endpoints)
    - OAuth2PasswordRequestForm extracts the username and password fields from form data in a login requests (standardizes how login endpoint accepts credentials).
    - OAuth2PasswordBearer class pulls the bearer token (JWT) from Authorization header so protected endpoints can decode the JWT
    - `middleware.py` intercepts login requests and authenticates the user before reaching login endpoint

4. Public Auth Routes (`routers/authentication.py`)
    - Sets up registration and login endpoints
    - Handles login form data

5. Protected User Routes (`routers/users.py`)
    - Sets up protected user endpoint
    - Defines job creation/upload endpoint

6. Job Lifecycle (`jobs.py`)
    - Validates uploaded file
    - Persist to `uploads/` directory
    - Creates a new Job object
    - Adds the new job to a Redis store

## React Frontend
1. Build & Entry Points (`frontend/src/main.tsx`, `App.tsx`)
    - BrowserRouter setup, layout shell, routing table.
    - `main.tsx` renders React app. React creates a single page application (SPA) by default. When the navigates to a different page via a router, the user is technically still on that one page, it's just that the React components in the `<App />` changes (js replaces the content on the screen). Note: This is different from classic webpages.
    - `App.tsx`

2. API Client Layer (`frontend/src/api`)
    - `client.ts` creates an Axios instance (with the base URL of the API) and registers request/response interceptors (similar to middleware). Also provides `setAccessToken` helper function to update/clear the stored token and an `AuthError` class for authentication errors.
    - `auth.ts` redirects frontend registration and login requests to the corresponding api endpoints. It also provides `fetchProfile` helper function to fetch user credentials (note: user authentication is checked before calling `fetchProfile`).
    - `jobs.ts` provides helper functions to interact with the jobs API endpoints. `uploadJob` uploads a new job to the backend and `fetchUserJobs` fetches the user's list of jobs.
    - Because React components only run in the browser, so it must send a POST request to FastAPI endpoints (e.g., for registration), we use the Axios library. The Axios instance simplifies handling HTTP requests and response for all components. The Axios instance takes care of attaching the base API URL, JSON headers, error handling, and parsing payload into POST request.

3. Auth State Management (`state/authStore.ts`, `components/AuthProvider.tsx`)
    - `AuthProvider.tsx` exposes the auth store data to all children components, who can call `useAuth()` to easily access authentication states from auth store. This is more convenient than passing props (typed data?) to child components every time. 
    - **Check understanding -- authStore (`state/authStore.ts`)**: the store holds **observable** data IN ONE PLACE about the user, status, error, and access token so that any React components can access them and automatically re-render when a state changes (e.g., authentication status). `authStore` also defined actions that can be called by components, such as `login`, `logout`, `hydrate`, and `setUser`. The implementation of these actions in the auth store ensure that the brower's `localStorage`, the auth store, and the module-level access token variable are all updated accordingly when an action handler is called. In short, the auth store centalizes user authentication states and action handlers for the React components to use.
        - React's before state management system is component level, so storing in one place
        - Observable so each time there is a state change, it will automatically rerender
        - Use `localStorage` to keep login session
    - **Check understanding -- context:** the context encapsulates all the authentication states (e.g., user, status, accesstoken, etc.) that later components may use. 

4. Route Guards & Navigation (`components/RequireAuth.tsx`, `NavBar.tsx`)
    - `NavBar.tsx` renders the navigation bar. If user is authenticated, it renders the username and links to the dashboard and to logout. Otherwise, it provides links to login and register.
    - `RequestAuth.tsx` checks if the user is authenticated at current route level and redirects to the login page if not. It is used to protect routes that require authentication.

5. General Reusable I/O Components 
    - `FormError.tsx` is a wrapper for defining how registration and login form error messages are rendered
    - `FormButton.tsx` defines registration and login form submission button and what is outputted on submit 
    - `TextField.tsx` defines a reusable text input component
    - `PasswordField.tsx` wraps `TextField` but adds a show/hide password toggle (with button and a `showPassword` state)

6. Registration and Login Forms
    - `RegisterForm.tsx` defines the inputs and rendering of registration form, verifies the valid registration credentials, and creates new user via helper function that uses Axios instance to send registration post request to FastAPI backend
    - `LoginForm.tsx` TODO
    - `Login.tsx` is a `LoginForm` wrapper that details how to render the login page, provides an option to redirect to register page, and conditionally shows successful registration if rerouted from registration.
    - `Register.tsx` is a `RegisterForm` wrapper that details how to render the registration page and provides an option to redirect to login page.

6. Dashboard Experience (`components/Dashboard.tsx`)
    - Renders the dashboard page with the user's profile, list of jobs, and file upload form. 
    - Requests a new job to be created in the backend each time a new file is uploaded via the helper function (Axios instance).
    - Includes profile fetching, job refresh, upload form UX, state transitions.
    - The dashboard lists jobs (filename, status, transcript text) via `GET /users/me/jobs/`.
<!-- 7. Styling
    - Tailwind usage, CSS entry points, asset pipeline. -->
Other Notes:
- Use typescript (statically typed) over javascript (dynamically typed), so more safety
- Everything in `frontend/src/` is the React application code. Files outside `src` are config files
- Vite framework helps optimize compilation
- `index.html` contains HTML tag, a headtag with some metadata, and executes `main.tsx`
- React uses declarative programming (vs. imperative programming), so no need to explain every step, only declares what to show. React updates the virtual DOM tree when a state changes, compares with old DOM, and only updates changes.
- In normal CSS, set a class (or className in React) on an element. In `App.css`, there are selectors for the classes for styling. Tailwindcss provides utility classes to simplify styling, so no need for `App.css`.
- Components: encapsulated, reuseable parts of UI (and can contain its own logic )
- `index.css` contains default styling for the application
- Props are function arguments to React components. In typescript, need to prepare a type for props (interface).
- `useState()` and `useEffect()` are hooks in React, which allows use of features like states and side effects.
- define how we handle submissions in `handleSubmit`
- Login submits `username/password` via `application/x-www-form-urlencoded` to `/auth/login` and receives a JWT.
- Authenticated uploads post `multipart/form-data` to `/users/me/jobs/` (audio files ≤5 MB). Job metadata + transcript placeholder will be returned and shown on the dashboard.
- The audio is split into smaller blocks and sent from the server. A progess bar would work by calculating the number of success blocks out of total blocks.

## Asynchronous Task Scheduling (Celery + Redis)

1. Celery App Configuration (`backend/celery/celery_app.py`)
    - Defines a Celery application, points the broker and result backend to local Redis server (`redis://localhost:6379/0`)
        - Celery broker(?): adds queues tasks for workers to consume
        - Result backend: 
    - Registers `backend.celery.transcribe` so the worker knows about the transcription tasks
        - When the API calls transcribe_audio.delay(job_id, path), Celery serializes that task payload and pushes it into the Redis result backend DB
    - Specifies JSON serialization/deserialization for payloads

2. Redis Roles
    - Broker: manage the queue of pending jobs for Celery workers will consume
    - Result backend: the store where Celery workers persist task results/statuses/metadata
        - If server restarts, result backend is cleared
    <!-- - Job store (`backend/api/job_store.py`): separate Redis hash space that stores every Job object (i.e., job_id, status, filename, owner, transcript, and stored_filename.) Includes helper functions `add_job`, `get_job`, `update_job`, and `get_all_jobs`. -->
    - Redis acts as cache so it allows for faster data retrieval than from persistent database (in-memory)
        - Using redis hash store is an optimization method
        - If using hash store, then must ensure data consistency with database
        - Redis does not guarantee persistence

3. Scheduling Flow (`backend/api/jobs.py`)
    - After validating and persisting an uploaded file, `create_job` calls `transcribe_audio.delay()` on the new job and stores the Celery task id into an in-memory list
    - Calling `transcribe_audio.delay()` on the new job enqueues a Celery task without blocking the HTTP request. The API responds immediately with the queued job metadata (metadata are updated during and after the job is processed).

4. Worker Execution (`backend/celery/transcribe.py`)
    - `transcribe_audio` task fetches the job from Redis job store, marks it `processing`, then processes the task (transcribe).
    - When done, updates the Redis backend metadata with status `completed` and transcript text, so `/users/me/jobs/` can reflect the finished result.

5. Accessing Jobs with AsyncResult
    - Celery worker (when started) reads from the Redis queue, processes the job, and save results (return value, status, metadata) to Redis backend to be updated and accessed. 
    - In `list_jobs` (in `backend/api/jobs.py`), use AsyncResult to fetch and return the job list (which is what `GET /users/me/jobs/` uses to provide frontend with details of this user's jobs)

# Faster Whisper Audio Transcription
    - Celery worker uses faster whisper model to transcribe task and updates the redis backend result metadata with the transcribed text for future access
    - The whisper model is loaded once and stored in a global variable when the worker processes its first task
    - https://github.com/SYSTRAN/faster-whisper?tab=readme-ov-file

# Utilizing Polling for Updates
1. Polling to check for job updates
    - Check for job updates by polling every 2 seconds
    - Implemented with React useEffect()
        - use useEffect() hook to (1) make network request to api backend and (2) manage the poll interval timer that needs to be created when the Dashboard component mounts and cleared when it unmounts.
    - Using `react-window` to only render/re-render the items currently in the user's visible area, which improves performance and keeps the total number of rendered element constant and minimal

## Persistent Database
Improvement: Move from in-memory stores to durable Postgres database.
1. Components
    - SQLAlchemy ORM for database models, engine, and session management. It offers easy ways to query and update its objects.
        - An engine object is a factory that can create new database connections and holds onto connections inside of a Connection Pool for fast reuse.
        - The Session establishes all conversations with the database, like a “holding zone” for all the objects loaded or associated with it during its lifespan. ORM models are maintained by a Session such that when an attribute is modified in the Python program, the Seesion records the change event that is generated.
    - Alembic for database schema migrations and version history
    - Postgres as the backing datastore 
        - Using`psycopg2` Python’s synchronous PostgreSQL library
        - The standard database that is widely used -- fast, open source, concurrent, reliable, efficient
    - Connecting it all: SQLAlchemy models define the database schema (structure, data types, nullable values) with the `Job` model. Alembic autogenerates migration scripts from the ORM models. The migrations apply changes to the Postgres database, so that the code and database stay in sync.
        
2. Configuration
    - Define `DATABASE_URL=postgresql://user:pass@host:5432/dbname` in env.
    - Define engine and SessionLocal defined in `backend/database/database.py`

3. Models (`backend/database/model.py`)
    - Declarative Base holds ORM models (i.e., `Job` with id, filename, status, transcript, owner, stored_filename, error_message, created_at/updated_at).


4. Session Lifecycle
    - SessionLocal dependency (`get_db`) yields a db session per request (open --> use --> commit --> close).
    - CRUD helpers (e.g., `create_job`, `get_job`, `list_jobs`) take a session to isolate DB access from routers.

5. Migration Workflow (Alembic)
    - `alembic.ini` targets migrations env; env.py reads `DATABASE_URL`.
    - `alembic init alembic` to initialize a new Alembic migration environment
    - `alembic revision --autogenerate -m "message"` to capture model differences between ORM models and the database schema
        - The database schema is the structured blueprint that defines how data is organized in a database. It is evolved via migrations to keep the database in sync with the ORM models.
    - `alembic upgrade head` to apply changes 
    - `alembic downgrade -1` to rollback changes

6. Job Persistence Workflow
    - Upload request validated and a new `Job` row inserted into `jobs` table with status `uploaded`
    - Celery worker updates job row status/transcript as processing completes
    - Dashboard polling reads jobs via ORM queries (previously read from Redis/in-memory)

<!-- 7. Local Dev Notes
    - Run Postgres locally (docker or host install); ensure user/role matches connection string.
    - Seed data/fixtures if needed; tests can use a temp database or transactional rollbacks. -->


<!-- ## End-to-End Workflows
- Registration: frontend form → `/auth/register` → storage update.
- Login: credential submission, middleware check, JWT issuance, client persistence.
- Authenticated calls: token injection via Axios interceptor, `/users/me/` guard chain.
- Audio upload & job listing: upload constraints, backend validation, dashboard refresh cycle.
- Error states (invalid token, oversized file) and how each layer responds. -->

## Next Steps
- Add persistent database (Postgres)
- Migrate authStore.ts to redux (optional but could be good)