import {
  createContractFromGig,
  createContractFromJob,
  getContractById,
  listMyContracts,
  submitMilestone,
} from '../services/contract.service.js';

export const createContractHandler = async (req, res, next) => {
  try {
    const { source, gigId, tier, proposalId, milestones } = req.body;
    let contract;
    if (source === 'gig') {
      contract = await createContractFromGig(req.user._id, gigId, tier);
    } else if (source === 'job') {
      contract = await createContractFromJob(req.user._id, proposalId, milestones);
    } else {
      const err = new Error('Invalid source, must be "gig" or "job"');
      err.statusCode = 400;
      throw err;
    }
    res.status(201).json({ success: true, data: { contract }, message: 'Contract created successfully' });
  } catch (err) {
    next(err);
  }
};

export const getContractHandler = async (req, res, next) => {
  try {
    const contract = await getContractById(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: { contract }, message: 'Contract fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const listMyContractsHandler = async (req, res, next) => {
  try {
    const contracts = await listMyContracts(req.user._id);
    res.status(200).json({ success: true, data: { contracts }, message: 'Contracts fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const submitMilestoneHandler = async (req, res, next) => {
  try {
    const contract = await submitMilestone(req.params.id, req.params.mId, req.user._id);
    res.status(200).json({ success: true, data: { contract }, message: 'Milestone submitted successfully' });
  } catch (err) {
    next(err);
  }
};
