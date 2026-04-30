# Application Mobile pour le distributeur de clé
## Lancement de l'application 
  ```bash
    npm install
  ```


## Mise en place : 

- Ouvrir le port 9002 sur le firewall du serveur
  ```bash
    sudo ufw status
    sudo ufw allow 9002
  ```

- Modifier la configuration nginx
   ```bash
    location /mqtt {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
   ```
## Téléchargement de l'application sur le mobile
1. Prendre l'APK dans les fichiers du dépot github
2. Si l'APK rencontre un problème ou que des changements sont apportés voici la méthode pour obtenir un nouveau AKP
  - Installer eas-cli
    ```bash
    npm install -g eas-cli
    ```
  - Créer un nouveau projet eas
    ```bash
    eas project:init
    ```
  - Changer de place le repertoire au besoin et appliquer les autorisation
    Dans certain cas, le build est refusé a cause des autrorisations de dossier
    ```bash
    mkdir C:\Votre_nouveau_chemin
    xcopy C:\Votre_chemin_actuel C:\Votre_nouveau_chemin /E /I /H /Y
    cd C:\Votre_nouveau_chemin
    ```
  - Ajouter 2 fichiers
    ```bash
    echo .idea/ > .easignore
    echo .vscode/ >> .easignore
    ```
  - Faire le build
    ```bash
    eas build -p android
    ```

    Le fichier Obtenu est un .aab il faut maitenant le transformer en .apk
    - Installer le fhciher pour faire la tranformation
      https://github.com/google/bundletool/releases
    - mettre le .jar dans le dossier du projet + le .aab généré
    - Faire la transformation en du .aab en .apk
      ```bash
      java -jar bundletool-all-1.18.3.jar build-apks --bundle=NOM_DU_.AAB --output=NOM_DU_APK_SOUHAITÉ --mode=universal
      ```

    - Trouver votre appareil
      ```bash
      adb devices
      ```
    - Télécharger l'APK sur le mobile
      ```bash
      java -jar bundletool-all-1.18.3.jar install-apks --apks=NOM_DU_.APK --device-id=ID_DU_DEVICE
      ```      
