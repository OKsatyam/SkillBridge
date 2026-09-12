import { submitProposal, listProposalsForJob, updateProposalStatus } from '../services/proposal.service.js';

export const submitProposalHandler = async (req, res, next) => {
  try {
    const proposal = await submitProposal(req.params.id, req.user._id, req.body);
    res.status(201).json({ success: true, data: { proposal }, message: 'Proposal submitted successfully' });
  } catch (err) {
    next(err);
  }
};

export const listProposalsForJobHandler = async (req, res, next) => {
  try {
    const proposals = await listProposalsForJob(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: { proposals }, message: 'Proposals fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateProposalStatusHandler = async (req, res, next) => {
  try {
    const proposal = await updateProposalStatus(req.params.id, req.user._id, req.body.status);
    res.status(200).json({ success: true, data: { proposal }, message: 'Proposal updated successfully' });
  } catch (err) {
    next(err);
  }
};
