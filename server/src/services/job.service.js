import Job from '../models/Job.js';
import { QueryFeatures } from '../utils/queryFeatures.js';

const ALLOWED_FIELDS = ['title', 'category', 'description', 'skills', 'budgetType', 'budget', 'deadline', 'status'];

export const createJob = async (clientId, data) => {
  const jobData = {};
  for (const field of ALLOWED_FIELDS) {
    if (data[field] !== undefined) jobData[field] = data[field];
  }
  jobData.client = clientId;
  return Job.create(jobData);
};

export const listJobs = async (queryString) => {
  const baseQuery = Job.find({ status: 'open' }); // public listing only shows open jobs
  const features = new QueryFeatures(baseQuery, queryString).search().filter().sort();
  const total = await features.countTotal();
  const jobs = await features.paginate().query
    .populate('client', 'name avatar rating')
    .populate('category', 'name slug');
  return { jobs, total };
};

export const getJobById = async (jobId) => {
  const job = await Job.findById(jobId)
    .populate('client', 'name avatar rating')
    .populate('category', 'name slug');
  if (!job) {
    const err = new Error('Job not found');
    err.statusCode = 404;
    throw err;
  }
  return job;
};

export const updateJob = async (job, updates) => {
  for (const field of ALLOWED_FIELDS) {
    if (updates[field] !== undefined) job[field] = updates[field];
  }
  await job.save();
  return job;
};

export const closeJob = async (job) => {
  job.status = 'closed';
  await job.save();
  return job;
};