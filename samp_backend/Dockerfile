
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app


COPY pom.xml .

RUN mvn dependency:go-offline


COPY src ./src


RUN mvn clean package -DskipTests


FROM eclipse-temurin:21-jre

WORKDIR /app


RUN groupadd -r spring && useradd -r -g spring spring

COPY --from=builder /app/target/*.jar app.jar

RUN chown spring:spring app.jar

USER spring

EXPOSE 8080

ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]