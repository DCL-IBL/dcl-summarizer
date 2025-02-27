#!/bin/bash
curl -X POST -H "Content-Type: application/json" -d '{"RAGQuery":"Кой е фараон на Египед познаваш?"}' http://localhost:8000/api/process-rag
