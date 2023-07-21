CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  original TEXT NOT NULL,
  shortened TEXT NOT NULL
);