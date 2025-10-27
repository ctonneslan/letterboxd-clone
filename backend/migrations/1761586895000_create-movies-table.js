export async function up(pgm) {
  pgm.createTable("movies", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    tmdb_id: {
      type: "integer",
      notNull: true,
      unique: true,
      comment: "The Movie Database (TMDB) ID",
    },
    title: {
      type: "varchar(500)",
      notNull: true,
    },
    original_title: {
      type: "varchar(500)",
      notNull: false,
    },
    overview: {
      type: "text",
      notNull: false,
    },
    tagline: {
      type: "text",
      notNull: false,
    },
    release_date: {
      type: "date",
      notNull: false,
    },
    runtime: {
      type: "integer",
      notNull: false,
      comment: "Runtime in minutes",
    },
    poster_path: {
      type: "varchar(255)",
      notNull: false,
      comment: "TMDB poster path",
    },
    backdrop_path: {
      type: "varchar(255)",
      notNull: false,
      comment: "TMDB backdrop path",
    },
    imdb_id: {
      type: "varchar(20)",
      notNull: false,
    },
    vote_average: {
      type: "numeric(3,1)",
      notNull: false,
      comment: "TMDB vote average (0.0-10.0)",
    },
    vote_count: {
      type: "integer",
      notNull: false,
    },
    popularity: {
      type: "numeric(10,3)",
      notNull: false,
      comment: "TMDB popularity score",
    },
    genres: {
      type: "jsonb",
      notNull: false,
      comment: "Array of genre objects from TMDB",
    },
    production_companies: {
      type: "jsonb",
      notNull: false,
    },
    production_countries: {
      type: "jsonb",
      notNull: false,
    },
    spoken_languages: {
      type: "jsonb",
      notNull: false,
    },
    status: {
      type: "varchar(50)",
      notNull: false,
      comment: "Released, Post Production, etc.",
    },
    budget: {
      type: "bigint",
      notNull: false,
    },
    revenue: {
      type: "bigint",
      notNull: false,
    },
    original_language: {
      type: "varchar(10)",
      notNull: false,
    },
    adult: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  // Create indexes
  pgm.createIndex("movies", "tmdb_id");
  pgm.createIndex("movies", "title");
  pgm.createIndex("movies", "release_date");
  pgm.createIndex("movies", "popularity");
  pgm.createIndex("movies", "imdb_id");
  pgm.sql("CREATE INDEX idx_movies_title_search ON movies USING gin(to_tsvector('english', title))");

  // Attach trigger to movies table for updated_at
  pgm.sql(`
    CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(pgm) {
  pgm.sql("DROP TRIGGER IF EXISTS update_movies_updated_at ON movies");
  pgm.dropTable("movies", { cascade: true });
}
