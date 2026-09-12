export const checkOwnership = (Model, ownerField = 'owner') => async (req, res, next) => {
  try {
    const resource = await Model.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, data: null, message: 'Resource not found' });
    }
    if (resource[ownerField].toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, data: null, message: 'Forbidden: you do not own this resource' });
    }
    req.resource = resource; // attach it — the controller can reuse this instead of fetching it again
    next();
  } catch (err) {
    next(err);
  }
};