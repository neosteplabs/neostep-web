@echo off

echo =========================================
NeoStep CLEAN Snapshot
echo =========================================

if not exist snapshots mkdir snapshots

set timestamp=%date:~-4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set timestamp=%timestamp: =0%

forfiles /p snapshots /m LLMS_CLEAN_*.txt /d -5 /c "cmd /c del @path"

echo.
echo Generating CLEAN snapshot...

call npx repomix app/api lib scripts types --output "snapshots\LLMS_CLEAN_%timestamp%.txt"

echo.
echo Snapshot created:
echo snapshots\LLMS_CLEAN_%timestamp%.txt

start snapshots

pause
