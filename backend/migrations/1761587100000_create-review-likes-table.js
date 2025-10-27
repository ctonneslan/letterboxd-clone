export async function up(pgm) {
  pgm.createTable("review_likes", {
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
    review_id: {
      type: "uuid",
      notNull: true,
      references: "reviews",
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  // One like per user per review
  pgm.addConstraint("review_likes", "unique_user_review_like", {
    unique: ["user_id", "review_id"],
  });

  // Create indexes
  pgm.createIndex("review_likes", "user_id");
  pgm.createIndex("review_likes", "review_id");
  pgm.createIndex("review_likes", ["user_id", "review_id"]);
}

export async function down(pgm) {
  pgm.dropTable("review_likes", { cascade: true });
}
