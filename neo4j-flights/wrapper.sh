#!/bin/bash

set -m

/docker-entrypoint.sh neo4j & ./setup.sh

fg %1