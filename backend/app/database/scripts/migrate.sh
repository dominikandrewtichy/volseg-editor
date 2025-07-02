#!/usr/bin/env bash

alembic -c app/database/alembic.ini "$@"
