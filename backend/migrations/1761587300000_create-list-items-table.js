export async function up(pgm) {
  pgm.createTable("list_items", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    list_id: {
      type: "uuid",
      notNull: true,
      references: "lists",
      onDelete: "CASCADE",
    },
    movie_id: {
      type: "uuid",
      notNull: true,
      references: "movies",
      onDelete: "CASCADE",
    },
    position: {
      type: "integer",
      notNull: true,
      default: 0,
      comment: "Position in the list for ranked lists",
    },
    notes: {
      type: "text",
      notNull: false,
      comment: "Optional notes about why this movie is in the list",
    },
    added_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  // One movie per list
  pgm.addConstraint("list_items", "unique_list_movie", {
    unique: ["list_id", "movie_id"],
  });

  // Create indexes
  pgm.createIndex("list_items", "list_id");
  pgm.createIndex("list_items", "movie_id");
  pgm.createIndex("list_items", ["list_id", "position"]);
}

export async function down(pgm) {
  pgm.dropTable("list_items", { cascade: true });
}
