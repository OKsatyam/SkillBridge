import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Contract from '../models/Contract.js';
import { notify } from './notification.service.js';

const throwErr = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

export const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) wallet = await Wallet.create({ user: userId });
  return wallet;
};

export const getWalletWithLedger = async (userId) => {
  const wallet = await getOrCreateWallet(userId);
  const transactions = await Transaction.find({ wallet: wallet._id }).sort('-createdAt');
  return { wallet, transactions };
};

const recordTxn = (walletId, type, amount, balanceAfter, contractId) =>
  Transaction.create({ wallet: walletId, type, amount, balanceAfter, contract: contractId });

export const deposit = async (userId, amount) => {
  if (amount <= 0) throwErr('Deposit amount must be positive', 400);
  const wallet = await getOrCreateWallet(userId);
  wallet.available += amount;
  await wallet.save();
  await recordTxn(wallet._id, 'deposit', amount, wallet.available);
  return wallet;
};

export const withdraw = async (userId, amount) => {
  if (amount <= 0) throwErr('Withdrawal amount must be positive', 400);
  const wallet = await getOrCreateWallet(userId);
  if (wallet.available < amount) throwErr('Insufficient available balance', 400);
  wallet.available -= amount;
  await wallet.save();
  await recordTxn(wallet._id, 'withdrawal', amount, wallet.available);
  return wallet;
};

// Guardrail: cannot fund with insufficient available balance; milestone must be "pending".
export const fundMilestone = async (contractId, milestoneId, clientId) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throwErr('Contract not found', 404);
  if (contract.client.toString() !== clientId.toString()) {
    throwErr('Forbidden: only the funding client may fund this milestone', 403);
  }
  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) throwErr('Milestone not found', 404);
  if (milestone.status !== 'pending') throwErr(`Cannot fund a milestone that is "${milestone.status}"`, 400);

  const wallet = await getOrCreateWallet(clientId);
  if (wallet.available < milestone.amount) throwErr('Insufficient available balance to fund this milestone', 400);

  wallet.available -= milestone.amount;
  wallet.escrow += milestone.amount;
  await wallet.save();
  await recordTxn(wallet._id, 'escrow_hold', milestone.amount, wallet.available, contract._id);

  milestone.status = 'funded';
  await contract.save();

  return contract;
};

// Guardrail: cannot release a milestone that is not submitted; only the funding client may approve;
// escrow can never go negative (checked before every decrement).
export const approveMilestone = async (contractId, milestoneId, clientId) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throwErr('Contract not found', 404);
  if (contract.client.toString() !== clientId.toString()) {
    throwErr('Forbidden: only the funding client may approve and release this milestone', 403);
  }
  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) throwErr('Milestone not found', 404);
  if (milestone.status !== 'submitted') {
    throwErr(`Cannot release a milestone that is not submitted (currently "${milestone.status}")`, 400);
  }

  const clientWallet = await getOrCreateWallet(clientId);
  if (clientWallet.escrow < milestone.amount) throwErr('Escrow inconsistency: not enough held funds', 400);

  clientWallet.escrow -= milestone.amount;
  await clientWallet.save();
  await recordTxn(clientWallet._id, 'escrow_release', milestone.amount, clientWallet.available, contract._id);

  const freelancerWallet = await getOrCreateWallet(contract.freelancer);
  freelancerWallet.available += milestone.amount;
  await freelancerWallet.save();
  await recordTxn(freelancerWallet._id, 'escrow_release', milestone.amount, freelancerWallet.available, contract._id);

  milestone.status = 'approved';

  const allApproved = contract.milestones.every((m) => m.status === 'approved');
  if (allApproved) contract.status = 'completed';

  await contract.save();

  await notify(
    contract.freelancer,
    'payment',
    `Payment released for milestone "${milestone.title}"`,
    `/contracts/${contract._id}`
  );

  return contract;
};

// Admin-only override for dispute resolution: releases funds to the freelancer without requiring
// milestone.status === 'submitted' or client authorization — an admin is adjudicating, not the client.
export const adminReleaseMilestone = async (contractId, milestoneId) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throwErr('Contract not found', 404);
  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) throwErr('Milestone not found', 404);
  if (!['funded', 'submitted', 'revision'].includes(milestone.status)) {
    throwErr(`Cannot release a milestone that is "${milestone.status}"`, 400);
  }

  const clientWallet = await getOrCreateWallet(contract.client);
  if (clientWallet.escrow < milestone.amount) throwErr('Escrow inconsistency: not enough held funds', 400);

  clientWallet.escrow -= milestone.amount;
  await clientWallet.save();
  await recordTxn(clientWallet._id, 'escrow_release', milestone.amount, clientWallet.available, contract._id);

  const freelancerWallet = await getOrCreateWallet(contract.freelancer);
  freelancerWallet.available += milestone.amount;
  await freelancerWallet.save();
  await recordTxn(freelancerWallet._id, 'escrow_release', milestone.amount, freelancerWallet.available, contract._id);

  milestone.status = 'approved';
  await contract.save();
  return contract;
};

// Used by admin dispute resolution (Phase 6) — refunds a held milestone back to the client.
export const refundMilestone = async (contractId, milestoneId) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throwErr('Contract not found', 404);
  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) throwErr('Milestone not found', 404);
  if (!['funded', 'submitted', 'revision'].includes(milestone.status)) {
    throwErr(`Cannot refund a milestone that is "${milestone.status}"`, 400);
  }

  const clientWallet = await getOrCreateWallet(contract.client);
  if (clientWallet.escrow < milestone.amount) throwErr('Escrow inconsistency: not enough held funds', 400);

  clientWallet.escrow -= milestone.amount;
  clientWallet.available += milestone.amount;
  await clientWallet.save();
  await recordTxn(clientWallet._id, 'refund', milestone.amount, clientWallet.available, contract._id);

  milestone.status = 'pending';
  contract.status = 'disputed';
  await contract.save();

  return contract;
};
