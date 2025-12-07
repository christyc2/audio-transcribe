# Audio Transcribe

For documentation, see [this file](documentation.md).

Run the backend with:

```bash
source backend/api/.api/bin/activate
uvicorn backend.api.main:app --reload
```

Run the frontend with:

```bash
source .venv/bin/activate
npm run dev
```

Run redis with:

```bash
redis-server
```
or
```bash
brew services start redis
```

Run celery with: 
```bash
celery -A backend.celery.celery_app worker --loglevel=INFO
```