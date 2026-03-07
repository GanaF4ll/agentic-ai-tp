up:
	docker compose up --build

back:
	docker compose up --build db back-end

front:
	docker compose up --build front-end

down:
	docker compose down

restore-db:
	docker compose exec db pg_restore -U app_user -d app_db --clean --if-exists /dumps/dump.pgc 2>/dev/null || true

clean:
	docker compose down -v
