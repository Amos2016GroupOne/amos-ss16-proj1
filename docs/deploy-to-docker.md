steps to perform to deploy to docker:
```
cd amos-ss16-proj1
cordova clean
ionic state restore
ionic prepare
bower update
docker/build
```
change to root:
```
sudo su
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker pull amos2016groupone/amos-ss16-proj1
docker build -t amos2016groupone/amos-ss16-proj1 docker/
docker push amos2016groupone/amos-ss16-proj1
```

