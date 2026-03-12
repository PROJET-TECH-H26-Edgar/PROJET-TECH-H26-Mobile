@echo off
setlocal

echo.
echo Désactivation temporaire du hook pre-push...

REM Renommer le hook pour le désactiver
if exist .git\hooks\pre-push (
    ren .git\hooks\pre-push pre-push.bak
    set hookWasPresent=true
) else (
    set hookWasPresent=false
)

echo Lancement du push...
git push

REM Restaurer le hook si présent
if "%hookWasPresent%"=="true" (
    echo Restauration du hook pre-push...
    ren .git\hooks\pre-push.bak pre-push
)

echo Push terminé sans exécution du hook.
endlocal
