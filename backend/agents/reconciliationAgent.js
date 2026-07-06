const fs = require('fs');
const path = require('path');

function runReconciliationAgent(intakeResult, documentResult) {
  let flags = [];
  let status = 'approved';
  
  const stockPath = path.join(__dirname, '../data/stock.json');
  let currentStock = {};
  
  try {
    if (fs.existsSync(stockPath)) {
      const rawData = fs.readFileSync(stockPath, 'utf8');
      currentStock = JSON.parse(rawData);
    }
  } catch (err) {
    console.error("Could not read stock records:", err);
  }

  // Define a mapping helper to normalize storefront names to stock.json keys
  const mapItemName = (name) => {
    if (!name) return 'Cotton Fabric Blue';
    const n = name.toLowerCase();
    if (n.includes('cotton')) return 'Cotton Fabric Blue';
    if (n.includes('silk')) return 'Silk Fabric Red';
    if (n.includes('polyester')) return 'Polyester Blend White';
    return name;
  };

  const itemToProcess = mapItemName(intakeResult?.output?.item);
  const qty = intakeResult?.output?.quantity || 1;

  // 1. Process Scenario A: Orders (Deduct Stock)
  if (intakeResult?.output?.task_type === 'order') {
    if (currentStock[itemToProcess]) {
      if (currentStock[itemToProcess].available_stock < qty) {
        status = 'flagged';
        flags.push({
          type: 'INVENTORY_SHORTFALL',
          detail: `Shortfall alert: Requested ${qty}m of ${itemToProcess}, but only ${currentStock[itemToProcess].available_stock}m available!`
        });
      } else {
        currentStock[itemToProcess].available_stock -= qty;
        try { fs.writeFileSync(stockPath, JSON.stringify(currentStock, null, 2), 'utf8'); } catch (e) { console.error("Write error", e); }
      }
    }
  }

  // 2. Process Scenario B: Invoices (Restock)
  if (intakeResult?.output?.task_type === 'invoice') {
    if (currentStock[itemToProcess]) {
      currentStock[itemToProcess].available_stock += qty;
      try { fs.writeFileSync(stockPath, JSON.stringify(currentStock, null, 2), 'utf8'); } catch (e) { console.error("Write error", e); }
    }
  }

  return {
    agent: 'reconciliation',
    status: status,
    flags: flags,
    reconciled_at: new Date().toISOString()
  };
}

module.exports = { runReconciliationAgent };