-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    spotify_id  VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    email       VARCHAR(255),
    avatar_url  TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artists (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    genre       VARCHAR(255),
    bio         TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plays (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artist_name VARCHAR(255) NOT NULL,
    track_name  VARCHAR(255) NOT NULL,
    played_at   TIMESTAMP NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- View: top Ukrainian artists by total plays across all users
CREATE OR REPLACE VIEW top_charts AS
    SELECT
        artist_name,
        COUNT(*)        AS play_count,
        MAX(played_at)  AS last_played
    FROM plays
    GROUP BY artist_name
    ORDER BY play_count DESC;
