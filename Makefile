up:
	docker compose up --build

back:
	docker compose up --build db back-end

front:
	docker compose up --build front-end

down:
	docker compose down

clean:
	docker compose down -v
