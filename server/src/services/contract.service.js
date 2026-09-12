import Contract from '../models/Contract.js';
import Gig from '../models/Gig.js';
import Proposal from '../models/Proposal.js';
import { notify } from './notification.service.js';
import { getOrCreateConversationForContract } from './conversation.service.js';

export const createContractFromGig = async (clientId, gigId, tier) => {
  const gig = await Gig.findById(gigId);
  if (!gig || gig.status !== 'active') {
    const err = new Error('Gig not available');
    err.statusCode = 404;
    throw err;
  }
  const pkg = gig.packages.find((p) => p.tier === tier);
  if (!pkg) {
    const err = new Error('Package tier not found on this gig');
    err.statusCode = 400;
    throw err;
  }

  const contract = await Contract.create({
    source: 'gig',
    gig: gig._id,
    client: clientId,
    freelancer: gig.owner,
    totalAmount: pkg.price,
    milestones: [
      {
        title: `${gig.title} (${tier})`,
        amount: pkg.price,
        dueDate: new Date(Date.now() + pkg.deliveryDays * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ],
  });

  await getOrCreateConversationForContract(contract);
  await notify(gig.owner, 'hire', `New order received for "${gig.title}"`, `/contracts/${contract._id}`);

  return contract;
};

export const createContractFromJob = async (clientId, proposalId, milestonesInput) => {
  const proposal = await Proposal.findById(proposalId).populate('job');
  if (!proposal) {
    const err = new Error('Proposal not found');
    err.statusCode = 404;
    throw err;
  }
  if (proposal.job.client.toString() !== clientId.toString()) {
    const err = new Error('Forbidden: not your job');
    err.statusCode = 403;
    throw err;
  }
  if (proposal.status === 'accepted') {
    const err = new Error('Proposal already accepted');
    err.statusCode = 400;
    throw err;
  }

  const milestones = milestonesInput?.length
    ? milestonesInput.map((m) => ({ title: m.title, amount: m.amount, dueDate: m.dueDate, status: 'pending' }))
    : [{ title: proposal.job.title, amount: proposal.bidAmount, status: 'pending' }];

  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);

  const contract = await Contract.create({
    source: 'job',
    job: proposal.job._id,
    proposal: proposal._id,
    client: clientId,
    freelancer: proposal.freelancer,
    totalAmount,
    milestones,
  });

  proposal.status = 'accepted';
  await proposal.save();

  proposal.job.status = 'awarded';
  await proposal.job.save();

  await getOrCreateConversationForContract(contract);
  await notify(
    proposal.freelancer,
    'hire',
    `You've been hired for "${proposal.job.title}"`,
    `/contracts/${contract._id}`
  );

  return contract;
};

export const getContractById = async (contractId, requesterId) => {
  const contract = await Contract.findById(contractId)
    .populate('client', 'name avatar')
    .populate('freelancer', 'name avatar')
    .populate('gig', 'title')
    .populate('job', 'title');
  if (!contract) {
    const err = new Error('Contract not found');
    err.statusCode = 404;
    throw err;
  }
  const isParty = [contract.client._id, contract.freelancer._id].some(
    (id) => id.toString() === requesterId.toString()
  );
  if (!isParty) {
    const err = new Error('Forbidden: not a party to this contract');
    err.statusCode = 403;
    throw err;
  }
  return contract;
};

export const listMyContracts = async (userId) => {
  return Contract.find({ $or: [{ client: userId }, { freelancer: userId }] })
    .populate('client', 'name avatar')
    .populate('freelancer', 'name avatar')
    .populate('gig', 'title')
    .populate('job', 'title')
    .sort('-createdAt');
};

// Milestone status transition only — no money moves here.
// Phase 4 (wallet.service.js) adds the actual escrow debit/credit into fund/approve.
export const submitMilestone = async (contractId, milestoneId, requesterId) => {
  const contract = await Contract.findById(contractId);
  if (!contract) {
    const err = new Error('Contract not found');
    err.statusCode = 404;
    throw err;
  }
  if (contract.freelancer.toString() !== requesterId.toString()) {
    const err = new Error('Forbidden: only the freelancer can submit work');
    err.statusCode = 403;
    throw err;
  }
  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) {
    const err = new Error('Milestone not found');
    err.statusCode = 404;
    throw err;
  }
  if (!['funded', 'revision'].includes(milestone.status)) {
    const err = new Error(`Cannot submit a milestone that is currently "${milestone.status}"`);
    err.statusCode = 400;
    throw err;
  }
  milestone.status = 'submitted';
  await contract.save();

  await notify(
    contract.client,
    'delivery',
    `Work submitted for milestone "${milestone.title}"`,
    `/contracts/${contract._id}`
  );

  return contract;
};
