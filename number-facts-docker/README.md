# Number Facts

A sample web app built to demonstrate what you can build with Docker.

# Consulter les données du volume 
docker run -it --rm --volume number-facts-docker_postgres_data:/data alpine:latest /bin/sh
ls /data