export async function up(pgm) {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    username: {
      type: "varchar(20)",
      notNull: true,
      unique: true,
    },
    email: {
      type: "varchar(255)",
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: "varchar(60)",
      notNull: true,
    },
    display_name: {
      type: "varchar(50)",
      notNull: false,
    },
    bio: {
      type: "text",
      notNull: false,
    },
    avatar_url: {
      type: "varchar(500)",
      notNull: false,
    },
    email_verified: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    is_active: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    is_public: {
      type: "boolean",
      notNull: true,
      default: true,
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

    last_login_at: {
      type: "timestamptz",
      notNull: false,
    },
  });

  // Create functional indexes using raw SQL
  pgm.sql("CREATE INDEX idx_users_username_lower ON users (LOWER(username))");
  pgm.sql("CREATE INDEX idx_users_email_lower ON users (LOWER(email))");
  pgm.createIndex("users", "created_at");

  // Create trigger function
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Attach trigger to users table
  pgm.sql(`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(pgm) {
  // Drop trigger
  pgm.sql("DROP TRIGGER IF EXISTS update_users_updated_at ON users");

  // Drop function
  pgm.sql("DROP FUNCTION IF EXISTS update_updated_at_column");

  // Drop table
  pgm.dropTable("users", { cascade: true });
}
