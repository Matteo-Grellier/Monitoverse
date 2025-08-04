# Makefile

COMPOSE = docker compose
DEV_FILES = -f docker-compose.dev.yaml
PROD_FILE = -f docker-compose.yaml


.PHONY: dev
dev:                              
	$(COMPOSE) $(DEV_FILES) up --force-recreate -d

.PHONY: up
up:                               
	$(COMPOSE) $(PROD_FILE) up --build -d

.PHONY: down
down:                             
	$(COMPOSE) $(DEV_FILES) down -v

.PHONY: logs
logs:                             
	$(COMPOSE) $(DEV_FILES) logs -f

.PHONY: build
build:
	$(COMPOSE) $(PROD_FILE) up --build --no-start

.PHONY: restart
restart:                          ## Redémarrer tous les services (dev)
	$(COMPOSE) $(DEV_FILES) restart
