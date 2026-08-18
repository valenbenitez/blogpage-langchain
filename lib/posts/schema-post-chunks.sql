-- post_chunks: derived RAG index (not the source of truth)
-- Requires: CREATE EXTENSION vector; (already done)
-- Embedding dim 1536 = OpenAI text-embedding-3-small (via AI Gateway)

create extension if not exists vector;

create table if not exists post_chunks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(1536) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint post_chunks_post_id_chunk_index_unique unique (post_id, chunk_index)
);

create index if not exists post_chunks_post_id_idx on post_chunks (post_id);

-- Cosine similarity search (good default for OpenAI embeddings)
create index if not exists post_chunks_embedding_hnsw_idx
  on post_chunks
  using hnsw (embedding vector_cosine_ops);
