@echo off
echo Starting AthleteHub Spring Boot Backend...
cd backend
set JAVA_HOME=C:\Program Files\Java\jdk-25
set PATH=%JAVA_HOME%\bin;%PATH%
..\maven\apache-maven-3.9.6\bin\mvn.cmd compile spring-boot:run
pause
