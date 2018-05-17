$isTestnet = $false
 
Write-Host "Started creation of Windows packages"

(Get-Content ..\Gruntfile.js).replace('0.14.7', '0.24.3') | Set-Content ..\Gruntfile.js
Write-Host "Chanaged nwjs version"

cd ..\
$currentProjectDirectory = (Get-Item -Path ".\" -Verbose).FullName
Remove-Item .\node_modules -Force -Recurse

bower install
Write-Host "Bower install completed"

npm install
Write-Host "Npm install completed"

grunt
Write-Host "Grunt completed"

Remove-Item ..\byteballbuilds -Force -Recurse
Write-Host "Removed old byteballbuilds"

Copy-Item -Path "$($currentProjectDirectory)\devbuilds\sqlite3\*" -Destination "$($currentProjectDirectory)\node_modules\sqlite3\lib\binding" -recurse -Force
Write-Host "Copied sqlite3 lib bindings"

if ($isTestnet) {
  (Get-Content "$($currentProjectDirectory)\node_modules\byteballcore\constants.js").replace("exports.version = '1.0';", "exports.version = '1.0t';") | Set-Content "$($currentProjectDirectory)\node_modules\byteballcore\constants.js"
  Write-Host "testnetified byteballcore constants"
  
  grunt desktop:testnet
  Write-Host "Grunt desktop completed"
  
  Write-Host "Start changing .exe internal resources"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet-tn\win32\DagWallet-tn.exe --set-version-string "FileDescription" "DagWallet-tn"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet-tn\win32\DagWallet-tn.exe --set-version-string "ProductName" "DagWallet-tn"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet-tn\win32\DagWallet-tn.exe --set-version-string "LegalCopyright" "Copyright 2018 Dagcoin"
  
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet-tn\win64\DagWallet-tn.exe --set-version-string "FileDescription" "DagWallet-tn"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet-tn\win64\DagWallet-tn.exe --set-version-string "ProductName" "DagWallet-tn"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet-tn\win64\DagWallet-tn.exe --set-version-string "LegalCopyright" "Copyright 2018 Dagcoin"
  Write-Host "Changed .exe resources"
  
  Write-Host "Started copying node_modules"
  Copy-Item -Path "$($currentProjectDirectory)\node_modules" -Destination ..\byteballbuilds\DagWallet-tn\win32\ -recurse -Force
  Copy-Item -Path "$($currentProjectDirectory)\node_modules" -Destination ..\byteballbuilds\DagWallet-tn\win64\ -recurse -Force
  Write-Host "Copied node_modules"
  
  Write-Host "Started grunt inno task"
  grunt inno64:testnet
  grunt inno32:testnet
  Write-Host "Completed grunt inno task"
} else {
  grunt desktop:live
  Write-Host "Grunt desktop completed"
  
  Write-Host "Start changing .exe internal resources"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet\win32\DagWallet.exe --set-version-string "FileDescription" "DagWallet"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet\win32\DagWallet.exe --set-version-string "ProductName" "DagWallet"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet\win32\DagWallet.exe --set-version-string "LegalCopyright" "Copyright 2018 Dagcoin"
  
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet\win64\DagWallet.exe --set-version-string "FileDescription" "DagWallet"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet\win64\DagWallet.exe --set-version-string "ProductName" "DagWallet"
  devbuilds\rcedit-x64 ..\byteballbuilds\DagWallet\win64\DagWallet.exe --set-version-string "LegalCopyright" "Copyright 2018 Dagcoin"
  Write-Host "Changed .exe resources"
  
  Write-Host "Started copying node_modules"
  Copy-Item -Path "$($currentProjectDirectory)\node_modules" -Destination ..\byteballbuilds\DagWallet\win32\ -recurse -Force
  Copy-Item -Path "$($currentProjectDirectory)\node_modules" -Destination ..\byteballbuilds\DagWallet\win64\ -recurse -Force
  Write-Host "Copied node_modules"
  
  Write-Host "Started grunt inno task"
  grunt inno64:live
  grunt inno32:live
  Write-Host "Completed grunt inno task"
}
