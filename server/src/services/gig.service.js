import Gig from '../models/Gig.js';
import { QueryFeatures } from '../utils/queryFeatures.js';

const ALLOWED_FIELDS = ['title', 'category', 'description', 'tags', 'packages', 'status'];

export const createGig = async (ownerId, data, imagePaths = []) => {
  const gigData = {};
  for (const field of ALLOWED_FIELDS) {
    if (data[field] !== undefined) gigData[field] = data[field];
  }
  gigData.owner = ownerId;
  if (imagePaths.length) gigData.images = imagePaths;
  return Gig.create(gigData);
};

export const listGigs = async (queryString) => {
  const baseQuery = Gig.find({ status: 'active' }); // public listing only ever shows active gigs
  const features = new QueryFeatures(baseQuery, queryString).search().filter().sort();
  const total = await features.countTotal();
  const gigs = await features.paginate().query
    .populate('owner', 'name avatar rating')
    .populate('category', 'name slug');
  return { gigs, total };
};

export const getGigById = async (gigId) => {
  const gig = await Gig.findById(gigId)
    .populate('owner', 'name avatar rating')
    .populate('category', 'name slug');
  if (!gig) {
    const err = new Error('Gig not found');
    err.statusCode = 404;
    throw err;
  }
  return gig;
};

export const updateGig = async (gig, updates, newImagePaths = []) => {
  for (const field of ALLOWED_FIELDS) {
    if (updates[field] !== undefined) gig[field] = updates[field];
  }
  if (newImagePaths.length) gig.images = [...gig.images, ...newImagePaths];
  await gig.save();
  return gig;
};

export const archiveGig = async (gig) => {
  gig.status = 'archived';
  await gig.save();
  return gig;
};