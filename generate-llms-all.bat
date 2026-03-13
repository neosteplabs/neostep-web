@echo off

echo =========================================
NeoStep AI Snapshot Generator
echo =========================================

if not exist snapshots mkdir snapshots

set timestamp=%date:~-4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set timestamp=%timestamp: =0%

forfiles /p snapshots /m LLMS_*.txt /d -5 /c "cmd /c del @path"

echo.
echo Generating CODE snapshot...
call npx repomix app components context lib types --output "snapshots\LLMS_CODE_%timestamp%.txt"

echo.
echo Generating ADMIN snapshot...
call npx repomix app/admin components/admin lib/server scripts --output "snapshots\LLMS_ADMIN_%timestamp%.txt"

echo.
echo Generating BACKEND snapshot...
call npx repomix app/api lib scripts types --output "snapshots\LLMS_BACKEND_%timestamp%.txt"

echo.
echo Generating FULL snapshot...
call npx repomix . --output "snapshots\LLMS_FULL_%timestamp%.txt"

echo.
echo =========================================
echo Snapshots Generated
echo =========================================

start snapshots

pause
