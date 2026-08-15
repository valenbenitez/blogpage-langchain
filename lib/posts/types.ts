export type PostStatus = 'draft' | 'published';

export type Post = {
    id: string;
    title: string;
    slug: string;
    content: string;
    status: PostStatus;
    summary: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export type PostChunk = {
    id: string;
    post_id: string;
    chunk_index: number;
    content: string;
    embedding: number[];
    metadata: {
        title: string;
        slug: string;
    };
    created_at: string;
}

export type CreatePostInput = {
    title: string;
    slug: string;
    content: string;
    summary: string;
    tags: string[];
    status: PostStatus;
}

export type UpdatePostInput = {
    title?: string;
    slug?: string;
    content?: string;
    status?: PostStatus;
    summary?: string;
    tags?: string[];
}