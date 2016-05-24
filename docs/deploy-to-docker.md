# Steps to perform to deploy to docker:
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
- goto https://mojo-ci.cs.fau.de/job/amos-ss16-team-1/ for starting the deploy job for https://osr-amos.cs.fau.de/ss16/proj1/


# Useful online documentation:
- http://cordova.apache.org/docs/en/latest/config_ref/index.html#sample-configxml
- http://ionicframework.com/docs/guide/publishing.html

