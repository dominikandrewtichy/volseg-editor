#!/usr/bin/env bash

# Requires migration message
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <message>"
    exit 1
fi

docker exec volseg-editor-api alembic -c app/database/alembic.ini revision --autogenerate -m "$1" && \
docker cp volseg-editor-api:/app/app/database/alembic/versions/ ./backend/app/database/alembic/
