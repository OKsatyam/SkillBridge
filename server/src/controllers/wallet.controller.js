import { getWalletWithLedger, deposit, withdraw, fundMilestone, approveMilestone } from '../services/wallet.service.js';

export const getWalletHandler = async (req, res, next) => {
  try {
    const { wallet, transactions } = await getWalletWithLedger(req.user._id);
    res.status(200).json({ success: true, data: { wallet, transactions }, message: 'Wallet fetched successfully' });
  } catch (err) {
    next(err);
  }
};

export const depositHandler = async (req, res, next) => {
  try {
    const wallet = await deposit(req.user._id, Number(req.body.amount));
    res.status(200).json({ success: true, data: { wallet }, message: 'Funds added successfully' });
  } catch (err) {
    next(err);
  }
};

export const withdrawHandler = async (req, res, next) => {
  try {
    const wallet = await withdraw(req.user._id, Number(req.body.amount));
    res.status(200).json({ success: true, data: { wallet }, message: 'Withdrawal successful' });
  } catch (err) {
    next(err);
  }
};

export const fundMilestoneHandler = async (req, res, next) => {
  try {
    const contract = await fundMilestone(req.params.id, req.params.mId, req.user._id);
    res.status(200).json({ success: true, data: { contract }, message: 'Milestone funded successfully' });
  } catch (err) {
    next(err);
  }
};

export const approveMilestoneHandler = async (req, res, next) => {
  try {
    const contract = await approveMilestone(req.params.id, req.params.mId, req.user._id);
    res.status(200).json({ success: true, data: { contract }, message: 'Milestone approved and released successfully' });
  } catch (err) {
    next(err);
  }
};
