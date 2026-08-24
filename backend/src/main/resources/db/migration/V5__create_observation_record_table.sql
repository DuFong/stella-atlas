CREATE TABLE observation_record (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(63) NOT NULL,
    latitude NUMERIC(8, 6),
    longitude NUMERIC(9, 6),
    comment VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT observation_record_timezone_not_blank CHECK (btrim(timezone) <> ''),
    CONSTRAINT observation_record_coordinate_pair CHECK (
        (latitude IS NULL AND longitude IS NULL)
        OR (latitude IS NOT NULL AND longitude IS NOT NULL)
    ),
    CONSTRAINT observation_record_latitude_range CHECK (
        latitude IS NULL OR latitude BETWEEN -90 AND 90
    ),
    CONSTRAINT observation_record_longitude_range CHECK (
        longitude IS NULL OR longitude BETWEEN -180 AND 180
    )
);

CREATE INDEX idx_observation_record_user_created
    ON observation_record (user_id, created_at DESC, id DESC);
