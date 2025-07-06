#!/usr/bin/env bash

set -e

echo "Running DB seed..."

python -m app.database.seed.seed_demo