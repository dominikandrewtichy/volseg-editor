#!/usr/bin/env bash

set -e

echo "Running Alembic migrations..."

alembic -c app/database/alembic.ini upgrade head
