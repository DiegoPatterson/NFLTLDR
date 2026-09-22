# Sideload APK. Java 25 cannot compile the native code, so this prefers a
# JDK 21 folder under %USERPROFILE%\jdks. The project path is long enough
# that the Android Ninja from the SDK fails; a newer Ninja in the SDK cmake
# folder (1.12 or newer) is required.
$ErrorActionPreference = "Stop"
$project = Split-Path $PSScriptRoot -Parent
$jdk = Get-ChildItem "$env:USERPROFILE\jdks" -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like "jdk-21*" } |
  Select-Object -First 1
if ($jdk) { $env:JAVA_HOME = $jdk.FullName }
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:NODE_ENV = "production"
Set-Location $project
npx expo prebuild --platform android --no-install
Set-Location "$project\android"
.\gradlew.bat assembleRelease --no-daemon
$apk = "$project\android\app\build\outputs\apk\release\app-release.apk"
New-Item -ItemType Directory -Force -Path "$project\dist" | Out-Null
Copy-Item $apk "$project\dist\FootballTLDR.apk" -Force
Write-Host "APK: $project\dist\FootballTLDR.apk"
