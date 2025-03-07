#!/bin/bash
curl -X POST -H "Content-Type: application/json" -d '{"collection":"text_docs"}' http://localhost:1316/api/clear-db
