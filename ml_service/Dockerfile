FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# libgomp1 is required by LightGBM at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x /app/docker-entrypoint.sh

# Models live on a named volume in docker-compose so a re-deploy without a
# fresh volume won't retrain from scratch every time.
VOLUME ["/app/models"]

EXPOSE 8001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
