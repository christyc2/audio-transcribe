FROM python:3.12-slim-bookworm

# Install ffmpeg with workaround for ARM64 Debian repository issues
# The libfribidi0 package from deb.debian.org sometimes fails on ARM64
# Strategy: Install in stages with better error handling
RUN apt-get clean && \
	rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* && \
	# Configure apt for better reliability
	echo 'Acquire::http::Timeout "120";' > /etc/apt/apt.conf.d/99timeout && \
	echo 'Acquire::Retries "10";' >> /etc/apt/apt.conf.d/99timeout && \
	echo 'Acquire::http::Pipeline-Depth "0";' >> /etc/apt/apt.conf.d/99timeout && \
	# Update package lists
	apt-get update && \
	# Install ffmpeg (will pull in libfribidi0 as dependency)
	# If this fails, the build will stop with a clear error
	apt-get install -y --no-install-recommends ffmpeg && \
	# Clean up
	rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* && \
	# Verify
	ffmpeg -version

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend ./backend

# Ensure shared uploads mount point exists in the container
RUN mkdir -p /uploads

# Keep Python from writing .pyc files and bufferless stdout for easier logs
ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

EXPOSE 8000

# Default command -- compose overrides for worker/migrate
CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]