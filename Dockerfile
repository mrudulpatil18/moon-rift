# Build backend
FROM --platform=linux/amd64 openjdk:25-jdk-slim
COPY target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]