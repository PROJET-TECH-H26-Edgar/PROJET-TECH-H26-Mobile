Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess -Force

# 1. Démarrer le serveur Metro via cmd
#cmd /c "npx expo start --android"
#Start-Process "cmd.exe" -ArgumentList "/c npx expo start --android --no-dev --minify"
#Start-Process "cmd.exe" -ArgumentList "/c npx expo start --android --no-dev --minify" -WindowStyle Hidden
Start-Process "cmd.exe" -ArgumentList "/c npx expo start --android"

Write-Host "Serveur Metro lance..."

# 2. Attendre que le bundler soit prêt
Start-Sleep -Seconds 5

# 3. Lancer les tests Maestro
#maestro test .maestro/login_flow.yaml --format junit --output result.xml
maestro test .maestro/main_flow.yaml --format junit --output result.xml

Write-Host "Tests Maestro executes"
Get-Content ".\result.xml"
#Start-Process ".\result.xml"