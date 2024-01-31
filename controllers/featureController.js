const Feature = require("../models/Feature");
const asyncWrapper = require("../middlewares/asyncWrapper");
const { createCustomError } = require("../errors/customError");

const formatFeature = (feature) => {
  const formattedFeature = {
    _id: feature._id,
    title: feature.title,
    description: feature.description,
    status: feature.status,
    createdBy: feature.createdBy,
    likes: feature.likes,
    comments: feature.comments,
    createdAt: feature.createdAt,
  };

  return formattedFeature;
};

/**
 * add new request
 * /api/v1/features/
 * private route (post)
 */
const createRequest = asyncWrapper(async (req, res) => {
  // Extract feature details from the request body
  const { title, description } = req.body;

  // Check if a feature with the same title and createdBy userId already exists
  const existingFeature = await Feature.findOne({
    title: { $regex: new RegExp(title, "i") },
    // "createdBy.userId": req.user._id,
  });

  if (existingFeature) {
    throw createCustomError("Feature with the same title already exists", 400);
  }

  // If no existing feature found, create a new one
  const feature = new Feature({
    title,
    description,
    createdBy: req.user._id,
  });

  // Save the new feature to the database
  await feature.save();

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  res.status(201).json({
    message: "Feature Request Successful",
    feature: formattedFeature,
  });
});

/**
 * all requests
 * /api/v1/features/
 * public route (get)
 */
const getAllRequest = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const statusFilter = req.query.status || "";

  let query = Feature.find({ isDeleted: false })
    .populate({
      path: "createdBy",
      match: { isDeleted: false },
      select: "name email photoURL isDeleted",
    })
    .populate({
      path: "likes.users",
      select: "email",
    });

  // Add status filter
  if (statusFilter) {
    query = query.where({ status: statusFilter });
  }

  // Handle sorting
  if (req.query.sortBy) {
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    if (sortBy === "createdAt") {
      query = query.sort({ createdAt: sortOrder });
    } else if (sortBy === "likes") {
      query = query.sort({ "likes.count": sortOrder });
    } else if (sortBy === "comments") {
      query = query.sort({ "comments.count": sortOrder });
    } else if (sortBy === "title") {
      query = query
        .sort({ title: sortOrder })
        .collation({ locale: "en", strength: 2 });
    }
  }

  // Execute query to get all features
  const features = await query.exec();

  // Filter out features created by soft deleted users
  const filteredFeatures = features.filter(
    (feature) => feature.createdBy !== null
  );

  // Map the features array to include only the desired fields
  const simplifiedFeatures = filteredFeatures.map((feature) => ({
    _id: feature._id,
    title: feature.title,
    description: feature.description,
    createdBy: feature.createdBy,
    createdAt: feature.createdAt,
    likes: feature.likes,
    status: feature.status,
    totalComments: feature.comments.count,
  }));

  // Calculate total items after filtering
  const totalItems = simplifiedFeatures.length;

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);
  const paginatedFeatures = simplifiedFeatures.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / limit);

  // Check if there are more items beyond the current page
  const hasMoreNext = page < totalPages;
  const hasMorePrev = page > 1;

  // Calculate counts for each status
  const statusCounts = await Feature.aggregate([
    {
      $match: {
        isDeleted: false,
        ...(statusFilter && { status: statusFilter }),
      },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const allItemsStatuses = statusCounts.reduce((acc, statusCount) => {
    acc[statusCount._id] = statusCount.count;
    return acc;
  }, {});

  res.status(200).json({
    message: "All features retrieved successfully",
    features: paginatedFeatures,
    pageInfo: {
      totalItems,
      totalPages,
      currentPage: page,
      hasMoreNext,
      hasMorePrev,
    },
    allItemsStatuses,
  });
});

/**
 * get single feature request
 * /api/v1/features/:id
 * private route (get)
 */
const getFeatureRequestById = asyncWrapper(async (req, res) => {
  // Get the request ID from req.params
  const featureId = req.params.id;

  const feature = await Feature.findById(featureId)
    .populate({
      path: "createdBy",
      select: "name email photoURL",
    })
    .populate({
      path: "likes.users",
      select: "email",
    })
    .populate({
      path: "comments.data.commentsBy",
      select: "name email photoURL createdAt",
    });

  if (!feature) {
    throw createCustomError("Feature not found", 404);
  }

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  res.status(200).json({
    message: "Feature fetched successfully",
    feature: formattedFeature,
  });
});

/**
 * Like a feature request by ID
 * /api/v1/features/:id/like
 * private route (patch)
 */
const likeFeatureRequestById = asyncWrapper(async (req, res) => {
  const featureId = req.params.id;
  const userId = req.user.id;

  // Check if the feature request exists
  const feature = await Feature.findById(featureId);

  if (!feature) {
    throw createCustomError("Feature not found", 404);
  }

  // Check if the user has already liked this feature
  const isLiked = feature.likes.users.includes(userId);

  if (!isLiked) {
    // User hasn't liked the feature, so like it
    feature.likes.users.push(userId);
    feature.likes.count += 1;

    // Save the updated feature to the database
    await feature.save();
  }

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  // Respond with the update message only
  res.json({
    message: "You liked the post!",
    feature: formattedFeature,
  });
});

/**
 * Unlike a feature request by ID
 * /api/v1/features/:id/unlike
 * private route (patch)
 */
const unlikeFeatureRequestById = asyncWrapper(async (req, res) => {
  const featureId = req.params.id;
  const userId = req.user.id;

  // Check if the feature request exists
  const feature = await Feature.findById(featureId);

  if (!feature) {
    throw createCustomError("Feature not found", 404);
  }

  // Check if the user has already liked this feature
  const isLiked = feature.likes.users.includes(userId);

  if (isLiked) {
    // User already liked the feature, so unlike it
    feature.likes.users.pull(userId);
    feature.likes.count -= 1;

    // Save the updated feature to the database
    await feature.save();
  }

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  // Respond with the update message only
  res.json({
    message: "You unliked the post!",
    feature: formattedFeature,
  });
});

/**
 * update feature requests
 * /api/v1/features/:id/update
 * private route (patch)
 */
const updateFeatureRequestById = asyncWrapper(async (req, res) => {
  const featureId = req.params.id;

  const { title, description } = req.body.data;

  // Check if the feature request exists
  const feature = await Feature.findById(featureId);

  if (!feature) {
    throw createCustomError("Feature not found", 404);
  }

  // Check if the authenticated user is the creator of the feature request
  if (req.user && feature.createdBy.toString() !== req.user.id) {
    throw createCustomError(
      "Unauthorized: You are not the creator of this feature request",
      403
    );
  }

  // Update the feature details
  feature.title = title;
  feature.description = description;

  // Save the updated feature to the database
  await feature.save();

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  // Respond with the update message and formatted feature
  res.json({
    success: true,
    message: "Feature Request Updated Successfully",
    feature: formattedFeature,
  });
});

/**
 * update feature requests status
 * /api/v1/features/:id
 * private route (patch)
 */
const updateRequestsStatusById = asyncWrapper(async (req, res) => {
  const featureId = req.params.id;
  const status = req.body.status;

  // Check if the feature request exists
  const feature = await Feature.findById(featureId);

  if (!feature) {
    throw createCustomError("Feature not found", 404);
  }

  // // Save the updated feature to the database
  feature.status = status;
  await feature.save();

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  // Respond with the update message only
  res.json({
    message: "Feature Request Updated Successfully",
    feature: formattedFeature,
  });
});

/**
 * (soft) delete feature request (for admin)
 * /api/v1/features/:id
 * private route (patch)
 */
const deleteRequestById = asyncWrapper(async (req, res) => {
  const featureId = req.params.id;

  // Check if the feature request exists
  const feature = await Feature.findById(featureId);

  if (!feature) {
    throw createCustomError("Feature not found", 404);
  }

  // // Save the updated feature to the database
  feature.isDeleted = true;
  await feature.save();

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  // Respond with the update message only
  res.json({
    message: "Feature Request Deleted Successfully",
    feature: formattedFeature,
  });
});

/**
 * delete feature request
 * /api/v1/features/:id
 * private route (patch)
 */
const deleteFeatureRequestById = asyncWrapper(async (req, res) => {
  const featureId = req.params.id;

  // Check if the feature request exists
  const feature = await Feature.findById(featureId);

  if (!feature) {
    throw createCustomError("Feature not found", 404);
  }

  // Check if the authenticated user is the creator of the feature request
  if (req.user && feature.createdBy.toString() !== req.user.id) {
    throw createCustomError(
      "Unauthorized: You are not the creator of this feature request",
      403
    );
  }

  // Delete the feature from the database
  await Feature.findByIdAndDelete(featureId);

  // Respond with the delete message
  res.json({
    success: true,
    message: "Feature Request Deleted Successfully",
  });
});

/**
 * add comment to feature requests
 * /api/v1/features/:id/comments
 * private route (patch)
 */
const addFeatureRequestCommentsById = asyncWrapper(async (req, res) => {
  const featureId = req.params.id;
  const userId = req.user.id;
  const { comment } = req.body;

  // Check if the feature request exists
  const feature = await Feature.findById(featureId).populate({
    path: "comments.data.commentsBy",
    select: "_id name email photoURL createdAt",
  });

  if (!feature) {
    throw createCustomError("Feature not found", 404);
  }

  // Add the new comment
  feature.comments.data.push({
    commentsBy: userId,
    comment: comment,
    createdAt: new Date(),
  });

  // Update comments count
  feature.comments.count += 1;

  // Save the updated feature to the database
  await feature.save();

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  // Respond with the updated feature
  res.json({
    message: "Comment successful",
    feature: formattedFeature,
  });
});

/**
 * update Comment By Id
 * /api/v1/features/:id/comments
 * private route (delete)
 */
const updateCommentById = asyncWrapper(async (req, res) => {
  const featureId = req.params.featureId;
  const commentId = req.params.commentId;
  const userId = req.user.id;
  const updatedCommentData = req.body.data;

  // Find the feature by ID
  const feature = await Feature.findById(featureId).populate({
    path: "comments.data.commentsBy",
    select: "_id name",
  });

  if (!feature) {
    throw createCustomError("Feature not found", 404);
  }

  // Find the comment in the feature's comments array
  const commentIndex = feature.comments.data.findIndex(
    (comment) => comment._id.toString() === commentId
  );

  if (commentIndex === -1) {
    throw createCustomError("Comment not found", 404);
  }

  // Remove the existing comment
  feature.comments.data.splice(commentIndex, 1);

  // Add the new comment
  feature.comments.data.push({
    commentsBy: userId,
    comment: updatedCommentData, // assuming you want to use the updated comment data
    createdAt: new Date(),
  });

  // Save the updated feature document
  await feature.save();

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  return res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    data: {
      feature: formattedFeature,
    },
  });
});

/**
 * delete feature request comment
 * /api/v1/features/:id/comments
 * private route (delete)
 */
const deleteCommentById = asyncWrapper(async (req, res) => {
  const featureId = req.params.featureId;
  const commentId = req.params.commentId;
  const userId = req.user.id;

  // Find the feature by ID
  const feature = await Feature.findById(featureId).populate({
    path: "comments.data.commentsBy",
    select: "_id name",
  });

  if (!feature) {
    return res.status(404).json({ error: "Feature not found" });
  }

  // Find the comment in the feature's comments array
  const comment = feature.comments.data.find(
    (comment) => comment._id.toString() === commentId
  );

  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  // Check if the user making the request is the one who posted the comment
  if (comment.commentsBy._id.toString() !== userId) {
    throw createCustomError(
      "Unauthorized. You cannot delete this comment..",
      403
    );
  }

  // Remove the comment from the comments array
  feature.comments.data = feature.comments.data.filter(
    (comment) => comment._id.toString() !== commentId
  );

  // Decrement the comments count
  feature.comments.count--;

  // Save the updated feature document
  await feature.save();

  // Format the feature details for the response
  const formattedFeature = formatFeature(feature);

  return res.status(200).json({
    message: "Comment deleted successfully",
    feature: formattedFeature,
  });
});

/**
 * search request comment
 * /api/v1/features/search/
 * public route (get)
 */
const searchFeatures = asyncWrapper(async (req, res) => {
  const searchTerm = req.params.searchTerm;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  // Perform a single query to get both totalItems and paginated features
  const result = await Feature.find({
    $and: [
      { isDeleted: false },
      {
        $or: [
          { title: { $regex: new RegExp(searchTerm, "i") } },
          { description: { $regex: new RegExp(searchTerm, "i") } },
        ],
      },
    ],
  })
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: "createdBy",
      select: "name email photoURL isDeleted",
    })
    .populate({
      path: "likes.users",
      select: "email",
    });

  // Extract features and totalItems from the result
  const features = result.map(formatFeature);

  const totalItems = await Feature.countDocuments({
    $and: [
      { isDeleted: false },
      {
        $or: [
          { title: { $regex: new RegExp(searchTerm, "i") } },
          { description: { $regex: new RegExp(searchTerm, "i") } },
        ],
      },
    ],
  });

  // Calculate pagination information
  const totalPages = Math.ceil(totalItems / limit);
  const hasMoreNext = page < totalPages;
  const hasMorePrev = page > 1;

  // Send the response
  return res.status(200).json({
    features,
    pageInfo: {
      totalItems,
      totalPages,
      currentPage: page,
      hasMoreNext,
      hasMorePrev,
    },
  });
});

module.exports = {
  createRequest,
  getAllRequest,
  getFeatureRequestById,
  likeFeatureRequestById,
  unlikeFeatureRequestById,
  updateFeatureRequestById,
  updateRequestsStatusById,
  deleteRequestById,
  deleteFeatureRequestById,
  addFeatureRequestCommentsById,
  updateCommentById,
  deleteCommentById,
  searchFeatures,
};
