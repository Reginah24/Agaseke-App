const Saving = require('../models/savingModel')

exports.createSaving = async (req, res) => {
  // #swagger.tags = ['Saving']
  try {
    const { goalName, targetAmount, lockUntil } = req.body

    // FIX 4: check for existing goal BEFORE creating the object in memory
    const existingSaving = await Saving.findOne({ userId: req.user.id })
    if (existingSaving)
      return res.status(400).json({ error: 'Saving goal already exists' })

    const saving = new Saving({
      userId: req.user.id,
      goalName,
      targetAmount,
      lockUntil
    })
    await saving.save()
    res.status(201).json(saving)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.addFunds = async (req, res) => {
  // #swagger.tags = ['Saving']
  try {
    const { amount } = req.body

    // FIX 10: reject zero or negative deposit amounts so the balance
    // cannot be reduced by passing a negative value to this endpoint
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Deposit amount must be a positive number.' })
    }

    const saving = await Saving.findOne({ userId: req.user.id })
    if (!saving) {
      return res.status(404).json({ error: 'No saving goal found. Create a saving goal first.' })
    }
    saving.currentAmount += Number(amount)
    await saving.save()
    res.json(saving)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// get user savings
exports.getUserSavings = async (req, res) => {
  // #swagger.tags = ['Saving']
  try {
    const savings = await Saving.find({ userId: req.user.id });
    res.json(savings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSavingById = async (req, res) => {
  // #swagger.tags = ['Saving']
  try {
    const saving = await Saving.findOne({ _id: req.params.id, userId: req.user.id });
    if (!saving) return res.status(404).json({ error: "Saving not found" });
    res.json(saving);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};