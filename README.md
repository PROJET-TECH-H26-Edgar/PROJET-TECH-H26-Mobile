# Application Mobile pour le distributeur de clé

##Mise en place : 

- Installation de expo pour emuler un android
  ```bash
    npm install -g expo-cli
  ```

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
  
- Pour lancer l'application
  ```bash
    npx expo start
  ```

