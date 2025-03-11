# DCL Summarizer - RAG System for Bulgarian Document Processing

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue)](https://www.docker.com)

Система за автоматично резюмиране на документи на български език с интеграция на големи езикови модели (LLM) и векторна база данни.

## Основни Характеристики
- Поддръжка на PDF/TXT документи
- Docker-базирана архитектура с 4 услуги:
  - Ollama LLM Service
  - ChromaDB Vector Store
  - Node.js Backend
  - React Frontend
    
## Инсталация

### Предварителни Изисквания
- Docker 20.10+
- Docker Compose 2.20+
- NVIDIA GPU (препоръчително)

### Конфигурация
Изберете моделите които ще използвате с променливите на средата в docker-compose.yml
- MODEL_EMB=mxbai-embed-large
- MODEL_LLM=llama3
- Изтеглете тези модели чрез Ollama API
   - curl http://localhost:11434/api/pull -d'{"model":"llama3"}'
   - curl http://localhost:11434/api/pull -d'{"model":"mxbai-embed-large"}'

### Стартиране
- sudo docker-compose build
- sudo docker-compose up -d

## Употреба

### Основни Команди
- Качване на документи: curl -X POST -F "txtFile=@/path/to/file.txt" http://localhost:8000/api/process-txt
- Тестови заявки: curl -X POST -H "Content-Type: application/json" -d '{"RAGQuery":"Кой е фараон на Египед познаваш?"}' http://localhost:8000/api/process-rag

### Потребителски Интерфейс
1. Отворете `http://localhost:3000`
2. Въведете заявка на български
