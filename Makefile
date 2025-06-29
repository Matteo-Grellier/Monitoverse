# Makefile

# ------------------------------------------------
# Variables
# ------------------------------------------------
COMPOSE = docker compose
DEV_FILES = -f docker-compose.dev.yaml
PROD_FILE = -f docker-compose.yaml

# ------------------------------------------------
# Cibles principales
# ------------------------------------------------

.PHONY: dev
dev:                              ## Lancer les services en mode dev (hot-reload)
	$(COMPOSE) $(DEV_FILES) up

.PHONY: up
up:                               ## Lancer les services en prod (build si besoin)
	$(COMPOSE) $(PROD_FILE) up --build -d

.PHONY: down
down:                             ## Arrêter et supprimer les conteneurs + volumes
	$(COMPOSE) $(DEV_FILES) down -v

.PHONY: logs
logs:                             ## Afficher les logs en temps réel
	$(COMPOSE) $(DEV_FILES) logs -f

.PHONY: build
build:                            ## Forcer le rebuild des images prod
	$(COMPOSE) $(PROD_FILE) up --build --no-start

.PHONY: restart
restart:                          ## Redémarrer tous les services (dev)
	$(COMPOSE) $(DEV_FILES) restart
