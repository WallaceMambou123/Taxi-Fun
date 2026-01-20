
# images: API + Postgres + Redis + pgAdmin

# pour les variables d'environnement (voir .env.example) pour la configuration
# il y a deux (02) fichiers .env. un dans le dossier racine (cd ../) et un dans celui-ci
# vous devez definir les variables d'environnement necessaires, par exemple :
# DATABASE_URL=postgresql://user:password@host:port/dbname

# la commande executee ce fichier est : sudo docker compose up --build
# vous devez etre dans le dossier taxifun_backend pour l'executer (ce dossier)
# Ce Dockerfile construit une image Docker pour une application NestJS utilisant Prisma ORM.

# en cas de reboot: sudo docker compose up -d --build

# Code & Sauvegarde : Tu modifies un fichier .ts dans VS Code, tu enregistres: 
# `sudo docker logs -f taxifun-api` . Tu verras NestJS redémarrer tout seul en 1 seconde.

# Prisma Studio : Tu peux le laisser tourner dans un coin en faisant : 
# `sudo docker exec -it taxifun-api npx prisma studio`

# Installation de nouveaux outils : Si tu as besoin d'une nouvelle librairie : 
# `sudo docker exec -it taxifun-api npm install name_du_package` 
#  Comme tu as un volume, le package sera aussi ajouté à ton dossier package.json 


# Commandes utiles :
# Schema de la commande:    sudo docker exec -it [DOCKER_CONTAINER] [COMMANDE]
# Installer un package:     sudo docker exec -it taxifun-api npm install [nom]
# Mettre à jour la DB:      sudo docker exec -it taxifun-api npx prisma db push
# Voir les logs en direct:  sudo docker logs -f taxifun-api
# Entrer dans le terminal:  sudo docker exec -it taxifun-api sh
# Relancer tout à zéro:     sudo docker-compose up -d --build


# Utilisation de Node 20 sur Alpine (léger et stable)
FROM node:20-alpine

# Installation de openssl pour que Prisma fonctionne sur Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# 1. Installer les dépendances en premier (optimisation du cache Docker)
COPY package*.json ./
# On utilise --legacy-peer-deps à cause des conflits NestJS 11 / ts-jest
RUN npm install --legacy-peer-deps

# 2. Générer le client Prisma 
# On le fait AVANT de copier tout le code pour gagner du temps au build
COPY prisma ./prisma/
RUN npx prisma generate

# 3. Copier le reste du code source
COPY . .

# 4. Construire l'application (transpilation TS -> JS)
RUN npm run build

# Port exposé par NestJS
EXPOSE 3000

# Commande de démarrage : npm run start:dev | npm run start:prod
CMD ["npm", "run", "start:prod"]