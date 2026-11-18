@echo off
setlocal
cd /d "%~dp0"
set "NODE_EXE="
for /f "delims=" %%N in ('where node.exe 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%N"
if defined NODE_EXE goto run
if defined CODEX_PRIMARY_RUNTIME_NODE if exist "%CODEX_PRIMARY_RUNTIME_NODE%" set "NODE_EXE=%CODEX_PRIMARY_RUNTIME_NODE%"
if defined NODE_EXE goto run
if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if defined NODE_EXE goto run
rem Runtime already available on Ben's machine; does not require a Node installation.
if exist "C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt\dependencies\node\bin\node.exe" set "NODE_EXE=C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1112-737-0_26.1112.737.0_x64__3k8sg7r9htsxt\dependencies\node\bin\node.exe"
if defined NODE_EXE goto run
for /d %%R in ("%ProgramFiles%\WindowsApps\OpenAI.CodexPrimaryRuntime*") do if exist "%%~fR\dependencies\node\bin\node.exe" set "NODE_EXE=%%~fR\dependencies\node\bin\node.exe"
if defined NODE_EXE goto run
echo Could not find a JavaScript runtime. Open this project in Codex and try again,
echo or install Node.js LTS from https://nodejs.org and reopen this launcher.
pause
exit /b 1
:run
echo Open the Local URL printed below in your browser.
echo Keep this window open while viewing the website.
"%NODE_EXE%" scripts/serve.mjs
pause
