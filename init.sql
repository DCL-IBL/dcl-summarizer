CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE queries (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'completed', 'error')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documents (
  id             BIGSERIAL PRIMARY KEY,
  chroma_id      UUID DEFAULT gen_random_uuid(),
  user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,  -- NULL = public
  title          TEXT NOT NULL UNIQUE,
  filename       TEXT,
  collection     TEXT,          -- ChromaDB collection name
  mime_type      TEXT,                   
  size_bytes     BIGINT,                 
  chunk_count    INTEGER DEFAULT 0,      -- number of vector chunks created
  status         TEXT NOT NULL DEFAULT 'pending' 
                  CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);