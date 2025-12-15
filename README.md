# VolSeg Editor

**VolSeg Editor** is a web application for converting CVSX files from [Mol* Volumes and Segmentation](https://molstar.org/volumes-and-segmentations/) to the modern MVSX and MVStory formats from [MolViewSpec](https://molstar.org/mol-view-spec/), [MolViewStories](https://molstar.org/mol-view-stories/), respectively. The web app allows for visualizing the converted entries, editing the underlying annotations, and sharing within the app or exporting into the aforementioned formats.

## 🚀 How to run

The easiest way to run the entire stack (web, API, database, minio) locally is via [Docker Compose](https://docs.docker.com/compose/).

Run the application and login as the demo user:

```bash
docker compose up --build --watch
```

- Frontend: http://localhost:5173
- API Swagger UI: http://localhost:8000/docs
- MinIO Console: http://localhost:9001 (User/Pass: minioadmin / minioadmin)

If you want to use a OIDC Provider (e.g., Auth0, Keycloak), you need to provide OIDC credentials. You can set these inline or create a `.env` file.

```bash
export OIDC_CLIENT_ID="your-client-id"
export OIDC_CLIENT_SECRET="your-client-secret"
```

## Database Migrations

Add new migration:
```shell
docker exec volseg-editor-api alembic -c app/database/alembic.ini revision --autogenerate -m "message"

# copy to local files from docker image
docker cp volseg-editor-api:/app/app/database/alembic/versions/ ./backend/app/database/alembic/
```

Apply migrations:
```shell
docker exec volseg-editor-api sh app/database/scripts/run-migrations.sh
```

### Seeding

Seed database and storage with example entries

```shell
docker exec volseg-editor-api python -m app.database.seed.seed_demo
```

## 🏗 Architecture

The project consists of a monorepo structure:

- `backend/`: Python FastAPI application using uv for dependency management.
- `frontend/`: React application using Vite, TailwindCSS, and ShadCN. Integrates the Mol* viewer.
- `helm/`: Kubernetes Helm charts for production deployment.
