import { raiseDispute, listOpenDisputes, resolveDispute } from '../services/dispute.service.js';

export const raiseDisputeHandler = async (req, res, next) => {
  try {
    const dispute = await raiseDispute(req.params.contractId, req.params.milestoneId, req.user._id, req.body.reason);
    res.status(201).json({ success: true, data: { dispute }, message: 'Dispute raised successfully' });
  } catch (err) {
    next(err);
  }
};

export const listOpenDisputesHandler = async (req, res, next) => {
  try {
    const disputes = await listOpenDisputes();
    res.status(200).json({ success: true, data: { disputes }, message: 'Disputes fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const resolveDisputeHandler = async (req, res, next) => {
  try {
    const dispute = await resolveDispute(req.params.id, req.user._id, req.body.outcome, req.body.resolution);
    res.status(200).json({ success: true, data: { dispute }, message: 'Dispute resolved successfully' });
  } catch (err) {
    next(err);
  }
};
