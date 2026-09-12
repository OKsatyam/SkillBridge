import { createJob, listJobs, getJobById, updateJob, closeJob } from '../services/job.service.js';

export const createJobHandler = async (req, res, next) => {
  try {
    const job = await createJob(req.user._id, req.body);
    res.status(201).json({ success: true, data: { job }, message: 'Job posted successfully' });
  } catch (err) {
    next(err);
  }
};

export const listJobsHandler = async (req, res, next) => {
  try {
    const { jobs, total } = await listJobs(req.query);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    res.status(200).json({
      success: true,
      data: { jobs, total, page, totalPages: Math.ceil(total / limit) },
      message: 'Jobs fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const getJobHandler = async (req, res, next) => {
  try {
    const job = await getJobById(req.params.id);
    res.status(200).json({ success: true, data: { job }, message: 'Job fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateJobHandler = async (req, res, next) => {
  try {
    const job = await updateJob(req.resource, req.body);
    res.status(200).json({ success: true, data: { job }, message: 'Job updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const closeJobHandler = async (req, res, next) => {
  try {
    const job = await closeJob(req.resource);
    res.status(200).json({ success: true, data: { job }, message: 'Job closed successfully' });
  } catch (err) {
    next(err);
  }
};