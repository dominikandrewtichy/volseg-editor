# CELLIM Viewer API

## Repomix

```shell
npx repomix --ignore '' --copy --output repopack.txt && rm -f repopack.txt
npx repomix --ignore 'app/database/seeding/*' --copy --output repopack.txt && rm -f repopack.txt
```

## Prerequisites

1. Install [uv](https://docs.astral.sh/uv/getting-started/installation/).

## How to setup environment

1. Create virtual environment
```shell
uv venv
```

2. Activate virtual environment
```shell
source .venv/bin/activate
```

## How to run app

```shell
fastapi dev
```

## Tests

```shell
uvx pytest
```

## Formatter

```shell
uvx ruff format
```

## Linter

```shell
uvx ruff check --fix
```

## Type checker

```shell
uv run mypy .
```

## Pre-commit hooks

1. Edit [.pre-commit-config.yaml](./.pre-commit-config.yaml)

2. Install git hook scripts

```shell
uvx pre-commit install
```

## Database

### Migrations

Add new migration
```shell
sh app/database/scripts/migrate.sh revision --autogenerate -m "message"
```

Apply migrations
```shell
sh app/database/scripts/migrate.sh upgrade head
```

### Seeding

Faker seed
```shell
docker exec -it cellim-viewer-api-dev uv run tools/db_cli.py seed
```

Prod seed
```shell
python -m app.database.seed
```