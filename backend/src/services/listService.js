import { sanitizeString } from '../utils/validation.js';

/**
 * Create a new list
 */
export async function createList(db, listData) {
  const { userId, name, description, isPublic, isRanked } = listData;

  if (!name || name.trim().length === 0) {
    const error = new Error('List name is required');
    error.statusCode = 400;
    throw error;
  }

  const sanitizedName = sanitizeString(name);
  const sanitizedDescription = description ? sanitizeString(description) : null;

  const result = await db.query(
    `INSERT INTO lists (user_id, name, description, is_public, is_ranked)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, sanitizedName, sanitizedDescription, isPublic ?? true, isRanked ?? false]
  );

  return formatListFromDb(result.rows[0]);
}

/**
 * Get list by ID
 */
export async function getListById(db, listId, requestingUserId = null) {
  const result = await db.query(
    `SELECT l.*,
            u.username, u.display_name, u.avatar_url,
            (SELECT COUNT(*) FROM list_items WHERE list_id = l.id) as item_count
     FROM lists l
     JOIN users u ON l.user_id = u.id
     WHERE l.id = $1`,
    [listId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const list = result.rows[0];

  // Check if list is private and user doesn't own it
  if (!list.is_public && list.user_id !== requestingUserId) {
    const error = new Error('This list is private');
    error.statusCode = 403;
    throw error;
  }

  return formatListWithDetails(list);
}

/**
 * Get lists by user
 */
export async function getListsByUser(db, userId, options = {}) {
  const { limit = 20, offset = 0, requestingUserId = null } = options;

  // If requestingUserId is different from userId, only show public lists
  const publicCheck = requestingUserId === userId ? '' : 'AND l.is_public = true';

  const result = await db.query(
    `SELECT l.*,
            (SELECT COUNT(*) FROM list_items WHERE list_id = l.id) as item_count
     FROM lists l
     WHERE l.user_id = $1 ${publicCheck}
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows.map(formatListFromDb);
}

/**
 * Get list items
 */
export async function getListItems(db, listId) {
  const result = await db.query(
    `SELECT li.*,
            m.tmdb_id, m.title, m.poster_path, m.release_date, m.vote_average
     FROM list_items li
     JOIN movies m ON li.movie_id = m.id
     WHERE li.list_id = $1
     ORDER BY li.position ASC, li.added_at DESC`,
    [listId]
  );

  return result.rows.map(formatListItemFromDb);
}

/**
 * Update a list
 */
export async function updateList(db, listId, userId, updates) {
  const { name, description, isPublic, isRanked } = updates;

  // Verify ownership
  const ownership = await db.query(
    'SELECT user_id FROM lists WHERE id = $1',
    [listId]
  );

  if (ownership.rows.length === 0) {
    const error = new Error('List not found');
    error.statusCode = 404;
    throw error;
  }

  if (ownership.rows[0].user_id !== userId) {
    const error = new Error('You do not have permission to edit this list');
    error.statusCode = 403;
    throw error;
  }

  // Build dynamic update query
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      const error = new Error('List name cannot be empty');
      error.statusCode = 400;
      throw error;
    }
    fields.push(`name = $${paramCount}`);
    values.push(sanitizeString(name));
    paramCount++;
  }

  if (description !== undefined) {
    fields.push(`description = $${paramCount}`);
    values.push(description ? sanitizeString(description) : null);
    paramCount++;
  }

  if (isPublic !== undefined) {
    fields.push(`is_public = $${paramCount}`);
    values.push(isPublic);
    paramCount++;
  }

  if (isRanked !== undefined) {
    fields.push(`is_ranked = $${paramCount}`);
    values.push(isRanked);
    paramCount++;
  }

  if (fields.length === 0) {
    return await getListById(db, listId, userId);
  }

  values.push(listId);

  const query = `
    UPDATE lists
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return formatListFromDb(result.rows[0]);
}

/**
 * Delete a list
 */
export async function deleteList(db, listId, userId) {
  // Verify ownership
  const ownership = await db.query(
    'SELECT user_id FROM lists WHERE id = $1',
    [listId]
  );

  if (ownership.rows.length === 0) {
    const error = new Error('List not found');
    error.statusCode = 404;
    throw error;
  }

  if (ownership.rows[0].user_id !== userId) {
    const error = new Error('You do not have permission to delete this list');
    error.statusCode = 403;
    throw error;
  }

  await db.query('DELETE FROM lists WHERE id = $1', [listId]);
}

/**
 * Add movie to list
 */
export async function addMovieToList(db, listId, movieId, userId, notes = null) {
  // Verify list ownership
  const list = await db.query(
    'SELECT user_id, is_ranked FROM lists WHERE id = $1',
    [listId]
  );

  if (list.rows.length === 0) {
    const error = new Error('List not found');
    error.statusCode = 404;
    throw error;
  }

  if (list.rows[0].user_id !== userId) {
    const error = new Error('You do not have permission to modify this list');
    error.statusCode = 403;
    throw error;
  }

  // Check if movie already in list
  const existing = await db.query(
    'SELECT id FROM list_items WHERE list_id = $1 AND movie_id = $2',
    [listId, movieId]
  );

  if (existing.rows.length > 0) {
    const error = new Error('Movie already in this list');
    error.statusCode = 409;
    throw error;
  }

  // Get next position if ranked list
  let position = 0;
  if (list.rows[0].is_ranked) {
    const maxPos = await db.query(
      'SELECT MAX(position) as max_position FROM list_items WHERE list_id = $1',
      [listId]
    );
    position = (maxPos.rows[0].max_position || 0) + 1;
  }

  const result = await db.query(
    `INSERT INTO list_items (list_id, movie_id, position, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [listId, movieId, position, notes ? sanitizeString(notes) : null]
  );

  return formatListItemFromDb(result.rows[0]);
}

/**
 * Remove movie from list
 */
export async function removeMovieFromList(db, listId, movieId, userId) {
  // Verify list ownership
  const list = await db.query(
    'SELECT user_id FROM lists WHERE id = $1',
    [listId]
  );

  if (list.rows.length === 0) {
    const error = new Error('List not found');
    error.statusCode = 404;
    throw error;
  }

  if (list.rows[0].user_id !== userId) {
    const error = new Error('You do not have permission to modify this list');
    error.statusCode = 403;
    throw error;
  }

  const result = await db.query(
    'DELETE FROM list_items WHERE list_id = $1 AND movie_id = $2 RETURNING id',
    [listId, movieId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Movie not found in this list');
    error.statusCode = 404;
    throw error;
  }
}

/**
 * Format list from database row
 */
function formatListFromDb(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    isPublic: row.is_public,
    isRanked: row.is_ranked,
    itemCount: row.item_count ? parseInt(row.item_count) : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Format list with user details
 */
function formatListWithDetails(row) {
  const list = formatListFromDb(row);

  if (row.username) {
    list.user = {
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    };
  }

  return list;
}

/**
 * Format list item from database row
 */
function formatListItemFromDb(row) {
  return {
    id: row.id,
    listId: row.list_id,
    movieId: row.movie_id,
    position: row.position,
    notes: row.notes,
    addedAt: row.added_at,
    movie: row.tmdb_id ? {
      tmdbId: row.tmdb_id,
      title: row.title,
      posterPath: row.poster_path,
      releaseDate: row.release_date,
      voteAverage: row.vote_average ? parseFloat(row.vote_average) : null,
    } : undefined,
  };
}
