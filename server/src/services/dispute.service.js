import Dispute from '../models/Dispute.js';
import Contract from '../models/Contract.js';
import { refundMilestone, adminReleaseMilestone } from './wallet.service.js';
import { notify } from './notification.service.js';

const throwErr = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

export const raiseDispute = async (contractId, milestoneId, raisedById, reason) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throwErr('Contract not found', 404);

  const isParty = [contract.client, contract.freelancer].some((id) => id.toString() === raisedById.toString());
  if (!isParty) throwErr('Forbidden: not a party to this contract', 403);

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) throwErr('Milestone not found', 404);

  const dispute = await Dispute.create({
    contract: contractId,
    milestone: milestoneId,
    raisedBy: raisedById,
    reason,
  });

  contract.status = 'disputed';
  await contract.save();

  return dispute;
};

export const listOpenDisputes = async () => {
  return Dispute.find({ status: 'open' })
    .populate('contract')
    .populate('raisedBy', 'name email')
    .sort('-createdAt');
};

export const resolveDispute = async (disputeId, adminId, outcome, resolutionNote) => {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) throwErr('Dispute not found', 404);
  if (dispute.status === 'resolved') throwErr('Dispute already resolved', 400);

  if (outcome === 'refund_client') {
    await refundMilestone(dispute.contract, dispute.milestone);
  } else if (outcome === 'release_freelancer') {
    await adminReleaseMilestone(dispute.contract, dispute.milestone);
  } else {
    throwErr('Invalid outcome — must be "refund_client" or "release_freelancer"', 400);
  }

  const contract = await Contract.findById(dispute.contract);
  if (contract && contract.status === 'disputed') {
    contract.status = 'active';
    await contract.save();
  }

  dispute.status = 'resolved';
  dispute.resolution = resolutionNote;
  dispute.resolvedBy = adminId;
  await dispute.save();

  const notifyUserId = outcome === 'refund_client' ? contract.client : contract.freelancer;
  await notify(notifyUserId, 'dispute', `Dispute resolved: ${resolutionNote || outcome}`, `/contracts/${contract._id}`);

  return dispute;
};
