export async function up(pgm) {
  pgm.createTable("lists", {
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
    name: {
      type: "varchar(100)",
      notNull: true,
    },
    description: {
      type: "text",
      notNull: false,
    },
    is_public: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    is_ranked: {
      type: "boolean",
      notNull: true,
      default: false,
      comment: "Whether the list is ordered/ranked",
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
  pgm.createIndex("lists", "user_id");
  pgm.createIndex("lists", "created_at");
  pgm.createIndex("lists", ["user_id", "is_public"]);

  // Full-text search on list name and description
  pgm.sql(
    "CREATE INDEX idx_lists_search ON lists USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')))"
  );

  // Attach trigger for updated_at
  pgm.sql(`
    CREATE TRIGGER update_lists_updated_at
    BEFORE UPDATE ON lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(pgm) {
  pgm.sql("DROP TRIGGER IF EXISTS update_lists_updated_at ON lists");
  pgm.dropTable("lists", { cascade: true });
}
