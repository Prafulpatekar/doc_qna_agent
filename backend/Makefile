PORT=8090
WORKERS=4
.PHONY: run-server
run-server:
	poetry run uvicorn src:app --port $(PORT) --workers $(WORKERS) --reload

.PHONY: env
env:
	poetry shell

.PHONY: env-clean
env-clean:
	poetry env remove --all

.PHONY: install
install:
	poetry install