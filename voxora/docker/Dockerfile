FROM python:3.10-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements/base.txt .
COPY requirements/prod.txt .

RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r prod.txt

FROM python:3.10-slim

WORKDIR /app

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements .

RUN pip install --no-cache /wheels/*

COPY . .

RUN chown -R www-data:www-data /app

USER www-data

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
