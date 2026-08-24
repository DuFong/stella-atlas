CREATE TABLE user_account (
    id UUID PRIMARY KEY,
    display_name VARCHAR(200),
    email VARCHAR(320),
    picture_url TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_user_account_timestamps CHECK (updated_at >= created_at)
);

CREATE TABLE oauth_identity (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_oauth_identity_provider_subject UNIQUE (provider, provider_subject),
    CONSTRAINT uq_oauth_identity_user_provider UNIQUE (user_id, provider),
    CONSTRAINT chk_oauth_identity_provider_not_blank CHECK (btrim(provider) <> ''),
    CONSTRAINT chk_oauth_identity_subject_not_blank CHECK (btrim(provider_subject) <> '')
);
