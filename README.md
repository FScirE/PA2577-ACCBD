# PA2577-ACCBD

## BuildSomething

### Components
- bsFrontend
- bsMean
- bsSearch
- MongoDB

### How to run
- Start
  - Docker compose:
  `docker compose -f dockerCompose.yml up`
  - Kubernetes:
  `kubectl apply -f kubernetes.yaml`

- Open in browser:
  - Docker compose: `localhost:8000`
  - Kubernetes: `localhost:3000`/`localhost:30011` (depends on if you use Docker Desktop or not)
