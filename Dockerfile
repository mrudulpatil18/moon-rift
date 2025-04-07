FROM --platform=linux/amd64 openjdk:17-jdk-slim

RUN apt-get update && apt-get install -y tzdata

ENV TZ=UTC

COPY target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]