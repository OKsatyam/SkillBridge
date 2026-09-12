import { createGig, listGigs, getGigById, updateGig, archiveGig } from '../services/gig.service.js';

const toImagePaths = (files = []) => files.map((f) => `/uploads/gigs/${f.filename}`);

export const createGigHandler = async (req, res, next) => {
  try {
    const packages = typeof req.body.packages === 'string' ? JSON.parse(req.body.packages) : req.body.packages;
    const tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
    const imagePaths = toImagePaths(req.files);
    const gig = await createGig(req.user._id, { ...req.body, packages, tags }, imagePaths);
    res.status(201).json({ success: true, data: { gig }, message: 'Gig created successfully' });
  } catch (err) {
    next(err);
  }
};

export const listGigsHandler = async (req, res, next) => {
  try {
    const { gigs, total } = await listGigs(req.query);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    res.status(200).json({
      success: true,
      data: { gigs, total, page, totalPages: Math.ceil(total / limit) },
      message: 'Gigs fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const getGigHandler = async (req, res, next) => {
  try {
    const gig = await getGigById(req.params.id);
    res.status(200).json({ success: true, data: { gig }, message: 'Gig fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateGigHandler = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (typeof updates.packages === 'string') updates.packages = JSON.parse(updates.packages);
    if (typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);
    const imagePaths = toImagePaths(req.files);
    const gig = await updateGig(req.resource, updates, imagePaths); // req.resource set by checkOwnership
    res.status(200).json({ success: true, data: { gig }, message: 'Gig updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const archiveGigHandler = async (req, res, next) => {
  try {
    const gig = await archiveGig(req.resource);
    res.status(200).json({ success: true, data: { gig }, message: 'Gig archived successfully' });
  } catch (err) {
    next(err);
  }
};