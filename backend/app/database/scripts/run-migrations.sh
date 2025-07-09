#!/usr/bin/env bash

set -e

echo "Running Alembic migrations..."

alembic -c alembic.ini upgrade head
