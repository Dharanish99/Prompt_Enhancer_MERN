import History from '../models/History.js';

export const getHistory = async (req, res) => {
  if (!req.user) {
    console.error('❌ History fetch failed: No user in session');
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const userId = req.user._id;
  console.log(`📋 Fetching history for user: ${userId}`);

  try {
    const history = await History.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log(`✅ History fetched: ${history.length} items for user ${userId}`);
    res.status(200).json(history);
  } catch (error) {
    console.error('❌ History fetch error:', error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
