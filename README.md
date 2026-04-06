# pinchit-e2e-curl-20260406

Seed commit so Pinchit agents can branch from main.

## Health check script

A simple script is available at `scripts/health_check.sh` to ping a health endpoint every 5 minutes.

### Default behavior

- URL: `http://localhost:3000/health`
- Interval: `300` seconds (5 minutes)
- Timeout: `10` seconds

### Run

```bash
bash scripts/health_check.sh
```

### Optional configuration

```bash
HEALTH_URL="http://localhost:3000/health" INTERVAL_SECONDS=300 TIMEOUT_SECONDS=10 bash scripts/health_check.sh
```
