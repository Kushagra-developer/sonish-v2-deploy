import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';

// @desc    Process Admin Assistant Command
// @route   POST /api/assistant
// @access  Private/Admin
const processCommand = async (req, res) => {
  const { command } = req.body;
  if (!command) {
    res.status(400);
    throw new Error('No command provided');
  }

  const cmd = command.toLowerCase();
  
  // 1. Inventory Query
  if (cmd.includes('stock') || cmd.includes('inventory') || cmd.includes('products')) {
    const products = await Product.find({});
    const lowStock = products.filter(p => p.countInStock < 5);
    res.json({
      message: `You currently have ${products.length} active products in your database. ${lowStock.length > 0 ? `⚠️ Alert: ${lowStock.length} items are critically low on stock!` : 'All inventory levels are perfectly healthy.'}`
    });
    return;
  }

  // 2. Orders Query
  if (cmd.includes('order') || cmd.includes('pending') || cmd.includes('sales')) {
    const pendingOrders = await Order.find({ isDelivered: false });
    const totalOrders = await Order.countDocuments();
    res.json({
      message: `You have ${pendingOrders.length} pending orders waiting for fulfillment, out of ${totalOrders} total historical orders.`
    });
    return;
  }

  // 3. Database Sync / Import
  if (cmd.includes('import') || cmd.includes('sync') || cmd.includes('data') || cmd.includes('update')) {
    res.json({
      message: `Active Synchronization is ready. Please launch the 'node backend/import-woo.js' script via terminal to pull the latest catalog from sonish.co.in directly into this MongoDB instance.`
    });
    return;
  }

  // 4. Default Fallback
  res.json({
    message: `Command received: "${command}". I am a highly specialized Admin Operations AI. Please use keywords like 'inventory', 'orders', or 'sync' to execute database actions.`
  });
};

export { processCommand };
