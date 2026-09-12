import Proposal from '../models/Proposal.js';
import Job from '../models/Job.js';
import { notify } from './notification.service.js';

export const submitProposal = async (jobId, freelancerId, data) => {
  const job = await Job.findById(jobId);
  if (!job) {
    const err = new Error('Job not found');
    err.statusCode = 404;
    throw err;
  }
  if (!['open', 'in-review'].includes(job.status)) {
    const err = new Error('This job is no longer accepting proposals');
    err.statusCode = 400;
    throw err;
  }

  const proposal = await Proposal.create({
    job: jobId,
    freelancer: freelancerId,
    coverLetter: data.coverLetter,
    bidAmount: data.bidAmount,
    durationDays: data.durationDays,
  });

  if (job.status === 'open') {
    job.status = 'in-review';
    await job.save();
  }

  await notify(job.client, 'proposal', `New proposal received on your job "${job.title}"`, `/jobs/${job._id}`);

  return proposal;
};

export const listProposalsForJob = async (jobId, requesterId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    const err = new Error('Job not found');
    err.statusCode = 404;
    throw err;
  }
  if (job.client.toString() !== requesterId.toString()) {
    const err = new Error('Forbidden: not your job');
    err.statusCode = 403;
    throw err;
  }
  return Proposal.find({ job: jobId }).populate('freelancer', 'name avatar rating skills').sort('-createdAt');
};

export const updateProposalStatus = async (proposalId, requesterId, status) => {
  const proposal = await Proposal.findById(proposalId).populate('job');
  if (!proposal) {
    const err = new Error('Proposal not found');
    err.statusCode = 404;
    throw err;
  }
  if (proposal.job.client.toString() !== requesterId.toString()) {
    const err = new Error('Forbidden: not your job');
    err.statusCode = 403;
    throw err;
  }
  proposal.status = status;
  await proposal.save();
  return proposal;
};
