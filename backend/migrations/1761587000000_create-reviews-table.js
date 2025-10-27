export async function up(pgm) {
  pgm.createTable("reviews", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    movie_id: {
      type: "uuid",
      notNull: true,
      references: "movies",
      onDelete: "CASCADE",
    },
    rating: {
      type: "numeric(2,1)",
      notNull: false,
      comment: "Star rating from 0.5 to 5.0 in 0.5 increments",
    },
    review_text: {
      type: "text",
      notNull: false,
    },
    contains_spoilers: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    is_public: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    watched_date: {
      type: "date",
      notNull: false,
      comment: "Date the user watched the movie",
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

  // One review per user per movie
  pgm.addConstraint("reviews", "unique_user_movie_review", {
    unique: ["user_id", "movie_id"],
  });

  // Rating must be between 0.5 and 5.0 in 0.5 increments
  pgm.sql(`
    ALTER TABLE reviews
    ADD CONSTRAINT check_rating_range
    CHECK (rating IS NULL OR (rating >= 0.5 AND rating <= 5.0 AND (rating * 2) = FLOOR(rating * 2)));
  `);

  // Create indexes
  pgm.createIndex("reviews", "user_id");
  pgm.createIndex("reviews", "movie_id");
  pgm.createIndex("reviews", "rating");
  pgm.createIndex("reviews", "created_at");
  pgm.createIndex("reviews", ["user_id", "movie_id"]);

  // Full-text search on review text
  pgm.sql(
    "CREATE INDEX idx_reviews_text_search ON reviews USING gin(to_tsvector('english', COALESCE(review_text, '')))"
  );

  // Attach trigger for updated_at
  pgm.sql(`
    CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(pgm) {
  pgm.sql("DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews");
  pgm.dropTable("reviews", { cascade: true });
}
