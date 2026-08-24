CREATE TABLE recent_location (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE,
    latitude NUMERIC(6, 4) NOT NULL,
    longitude NUMERIC(7, 4) NOT NULL,
    timezone VARCHAR(63) NOT NULL,
    last_queried_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_recent_location_user_coordinate UNIQUE (user_id, latitude, longitude),
    CONSTRAINT chk_recent_location_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_recent_location_longitude CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT chk_recent_location_timezone_not_blank CHECK (btrim(timezone) <> '')
);

CREATE INDEX idx_recent_location_user_queried
    ON recent_location (user_id, last_queried_at DESC, id DESC);
