FROM python:3.12-slim-bookworm

# Install ffmpeg with workaround for ARM64 Debian repository issues
# The libfribidi0 package from deb.debian.org sometimes fails on ARM64
# Strategy: Install in stages with better error handling
RUN apt-get clean && \
	rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* && \
	apt-get update && \
	apt-get install -y --no-install-recommends ffmpeg && \
	rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* && \
	# Verify ffmpeg installation
	ffmpeg -version

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend ./backend

# Keep Python from writing .pyc files and bufferless stdout for easier logs
ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

EXPOSE 8000

# Default command -- compose overrides for worker/migrate
CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]