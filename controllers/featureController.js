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
 * private route (get)
 */
const getAllRequest = asyncWrapper(async (req, res) => {
  const features = await Feature.find({ isDeleted: false })
    .sort({ _id: -1 })
    .populate({
      path: "createdBy",
      match: { isDeleted: false },
      select: "name email photoURL isDeleted",
    })
    .populate({
      path: "likes.users",
      select: "email",
    });

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

  res.status(200).json({
    message: "All features retrieved successfully",
    features: simplifiedFeatures,
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

  // Sort comments based on the createdAt field (newest first)
  // feature.comments.data.sort((a, b) => b.createdAt - a.createdAt);

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
    message: "Feature liked successfully",
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
    message: "Feature unliked successfully",
    feature: formattedFeature,
  });
});

module.exports = {
  likeFeatureRequestById,
  unlikeFeatureRequestById,
};

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
    message: "Feature status updated successfully",
    feature: formattedFeature,
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
    return res
      .status(403)
      .json({ error: "Unauthorized. You cannot delete this comment." });
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

  // Replace with your actual database query logic
  // const results = await Feature.find({
  //   $or: [
  //     { title: { $regex: new RegExp(searchTerm, "i") } },
  //     { description: { $regex: new RegExp(searchTerm, "i") } },
  //   ],
  // });

  const features = await Feature.find({
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
    .populate({
      path: "createdBy",
      select: "name email photoURL isDeleted",
    })
    .populate({
      path: "likes.users",
      select: "email",
    });

  // Format the features for the response
  const formattedFeatures = features.map(formatFeature);

  return res.status(200).json({
    features: formattedFeatures,
  });
});

module.exports = {
  createRequest,
  getAllRequest,
  getFeatureRequestById,
  likeFeatureRequestById,
  unlikeFeatureRequestById,
  updateRequestsStatusById,
  addFeatureRequestCommentsById,
  deleteCommentById,
  searchFeatures,
};
