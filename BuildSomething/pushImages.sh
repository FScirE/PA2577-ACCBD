readonly DOCKER_USER="fscire"

#execute from /BuildSomething

docker build -t "${DOCKER_USER}/bs-frontend:v1" ./bsFrontend
docker push "${DOCKER_USER}/bs-frontend:v1"

docker build -t "${DOCKER_USER}/bs-mean:v1" ./bsMean
docker push "${DOCKER_USER}/bs-mean:v1"

docker build -t "${DOCKER_USER}/bs-search:v1" ./bsSearch
docker push "${DOCKER_USER}/bs-search:v1"

echo "Images pushed, run with 'kubectl apply -f kubernetes.yaml'"
