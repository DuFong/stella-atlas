CREATE TABLE favorite_location (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    latitude NUMERIC(8, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    timezone VARCHAR(63) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_favorite_location_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT chk_favorite_location_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_favorite_location_longitude CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT chk_favorite_location_timezone_not_blank CHECK (btrim(timezone) <> '')
);

CREATE INDEX idx_favorite_location_user_created
    ON favorite_location (user_id, created_at, id);
