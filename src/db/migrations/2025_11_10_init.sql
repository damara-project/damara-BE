-- Damara initial schema
-- This migration reflects the requirements described in the functional spec (2025-11-10).

BEGIN;

-- Domain enums ----------------------------------------------------------------

CREATE TYPE post_status AS ENUM ('draft', 'open', 'closed', 'cancelled');
CREATE TYPE settlement_type AS ENUM ('prepaid', 'postpaid');
CREATE TYPE fulfilment_type AS ENUM ('pickup', 'delivery', 'mixed');
CREATE TYPE participant_status AS ENUM ('joined', 'cancelled');
CREATE TYPE notification_type AS ENUM (
  'post_comment',
  'post_participation',
  'post_deadline',
  'system'
);

-- Users ----------------------------------------------------------------------

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  nickname        TEXT NOT NULL,
  department      TEXT,
  student_id      TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_created_at ON users (created_at);

-- Posts ----------------------------------------------------------------------

CREATE TABLE posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,
  category            TEXT NOT NULL,
  total_quantity      INTEGER,
  max_participants    INTEGER NOT NULL CHECK (max_participants > 0),
  unit_price          NUMERIC(10, 2),
  total_price         NUMERIC(12, 2),
  settlement          settlement_type NOT NULL,
  fulfilment          fulfilment_type NOT NULL,
  pickup_location     TEXT,
  payment_instructions TEXT,
  deadline            TIMESTAMPTZ NOT NULL,
  status              post_status NOT NULL DEFAULT 'open',
  tags                TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at           TIMESTAMPTZ
);

CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX idx_posts_deadline ON posts (deadline);
CREATE INDEX idx_posts_category ON posts (category);
CREATE INDEX idx_posts_tags_gin ON posts USING GIN (tags);

-- Post images ----------------------------------------------------------------

CREATE TABLE post_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_post_images_post_id ON post_images (post_id, sort_order);

-- Participants ---------------------------------------------------------------

CREATE TABLE participants (
  post_id     UUID NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status      participant_status NOT NULL DEFAULT 'joined',
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX idx_participants_post_status ON participants (post_id, status);
CREATE INDEX idx_participants_user ON participants (user_id);

-- Comments -------------------------------------------------------------------

CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES comments (id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post_created_at ON comments (post_id, created_at);

-- Chats ----------------------------------------------------------------------

CREATE TABLE chats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID UNIQUE REFERENCES posts (id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'group',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat members ---------------------------------------------------------------

CREATE TABLE chat_members (
  chat_id     UUID NOT NULL REFERENCES chats (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at     TIMESTAMPTZ,
  PRIMARY KEY (chat_id, user_id)
);

CREATE INDEX idx_chat_members_user ON chat_members (user_id);

-- Messages -------------------------------------------------------------------

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id     UUID NOT NULL REFERENCES chats (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  file_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_chat_created_at ON messages (chat_id, created_at);

-- Notifications --------------------------------------------------------------

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

-- Reports (optional) ---------------------------------------------------------

CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT NOT NULL, -- e.g. 'post', 'comment', 'user'
  entity_id     UUID NOT NULL,
  reporter_id   UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reason        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status        TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX idx_reports_entity ON reports (entity_type, entity_id);

COMMIT;

