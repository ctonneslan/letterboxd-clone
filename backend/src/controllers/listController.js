import {
  createList,
  getListById,
  getListsByUser,
  getListItems,
  updateList,
  deleteList,
  addMovieToList,
  removeMovieFromList,
} from '../services/listService.js';

/**
 * Create a new list
 * POST /api/v1/lists
 */
export async function createListHandler(req, res, next) {
  try {
    const { name, description, isPublic, isRanked } = req.body;

    const list = await createList(req.db, {
      userId: req.userId,
      name,
      description,
      isPublic,
      isRanked,
    });

    res.status(201).json({
      success: true,
      data: { list },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get list by ID
 * GET /api/v1/lists/:id
 */
export async function getListHandler(req, res, next) {
  try {
    const { id } = req.params;

    const list = await getListById(req.db, id, req.userId);

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'List not found',
      });
    }

    // Get list items
    const items = await getListItems(req.db, id);

    res.status(200).json({
      success: true,
      data: {
        list,
        items,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get lists by user
 * GET /api/v1/lists/user/:username
 */
export async function getUserListsHandler(req, res, next) {
  try {
    const { username } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get user ID from username
    const userResult = await req.db.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const userId = userResult.rows[0].id;

    const lists = await getListsByUser(req.db, userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      requestingUserId: req.userId,
    });

    res.status(200).json({
      success: true,
      data: {
        lists,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: lists.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a list
 * PUT /api/v1/lists/:id
 */
export async function updateListHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, isPublic, isRanked } = req.body;

    const list = await updateList(req.db, id, req.userId, {
      name,
      description,
      isPublic,
      isRanked,
    });

    res.status(200).json({
      success: true,
      data: { list },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a list
 * DELETE /api/v1/lists/:id
 */
export async function deleteListHandler(req, res, next) {
  try {
    const { id } = req.params;

    await deleteList(req.db, id, req.userId);

    res.status(200).json({
      success: true,
      message: 'List deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add movie to list
 * POST /api/v1/lists/:id/items
 */
export async function addMovieToListHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { movieId, notes } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        error: 'Movie ID is required',
      });
    }

    const item = await addMovieToList(req.db, id, movieId, req.userId, notes);

    res.status(201).json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove movie from list
 * DELETE /api/v1/lists/:id/items/:movieId
 */
export async function removeMovieFromListHandler(req, res, next) {
  try {
    const { id, movieId } = req.params;

    await removeMovieFromList(req.db, id, movieId, req.userId);

    res.status(200).json({
      success: true,
      message: 'Movie removed from list',
    });
  } catch (error) {
    next(error);
  }
}
