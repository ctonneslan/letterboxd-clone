export async function up(pgm) {
  pgm.createTable("watchlist", {
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
    added_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  // One movie per user watchlist
  pgm.addConstraint("watchlist", "unique_user_movie_watchlist", {
    unique: ["user_id", "movie_id"],
  });

  // Create indexes
  pgm.createIndex("watchlist", "user_id");
  pgm.createIndex("watchlist", "movie_id");
  pgm.createIndex("watchlist", ["user_id", "added_at"]);
}

export async function down(pgm) {
  pgm.dropTable("watchlist", { cascade: true });
}
