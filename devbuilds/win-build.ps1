$isTestnet = $true
$isFirstRun = $false

cd ..\
$currentProjectDirectory = (Get-Item -Path ".\" -Verbose).FullName
Remove-Item .\node_modules -Force -Recurse

if ($isFirstRun) {
  npm install bower@1.8.2
  npm install grunt@1.0.1
  npm install grunt-cli@1.2.0
  npm install grunt-contrib-sass@1.0.0
  npm install gulp@3.9.1
  npm install node-sass@4.5.3
  npm install npm@5.5.1
  npm install npm-check-updates@2.13.0
  npm install nw@0.24.3
  npm install nw-gyp@3.6.2
}

bower install
Write-Host "Bower install completed"

npm install
Write-Host "Npm install completed"

grunt
Write-Host "Grunt completed"

Copy-Item -Path "$($currentProjectDirectory)\devbuilds\sqlite3\*" -Destination "$($currentProjectDirectory)\node_modules\sqlite3\lib\binding" -recurse -Force
Write-Host "Copied sqlite3 lib bindings"

if ($isTestnet) {
  (Get-Content "$($currentProjectDirectory)\node_modules\byteballcore\constants.js").replace("exports.version = '1.0';", "exports.version = '1.0t';") | Set-Content "$($currentProjectDirectory)\node_modules\byteballcore\constants.js"
  Write-Host "testnetified byteballcore constants"
}

nw
