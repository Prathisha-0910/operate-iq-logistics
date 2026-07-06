const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Import all autonomous agents
const { runIntakeAgent } = require('../agents/intakeAgent');
const { runDocumentAgent } = require('../agents/documentAgent');
const { runReconciliationAgent } = require('../agents/reconciliationAgent');
const { runRoutingAgent } = require('../agents/routingAgent');
const { createAuditLog } = require('../agents/auditAgent');

// Memory storage for tasks since we are simulating a live environment
let globalTasks = [];

router.post('/process', async (req, res) => {
  try {
    const { message, documentText } = req.body;
    
    // Generate a unique short tracking hash for the user (e.g. #3Y8T4O0H)
    const taskId = 'TRK' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const source = documentText ? 'document' : 'chat';

    // 1. Intake Agent Phase
    const intakeResult = await runIntakeAgent(message, documentText);

    // 2. Document Intelligence Phase (only runs if document text exists)
    // 2. Document Intelligence Phase (only runs if document text exists)
    let docResult = null;
    if (source === 'document') {
      docResult = await runDocumentAgent(documentText);
    }

    // 3. Reconciliation Agent Phase (checks stock.json)
    const reconResult = await runReconciliationAgent(intakeResult, docResult);

    // 4. Routing Agent Phase (assigns owner and sets priority)
    const routingResult = await runRoutingAgent(intakeResult, reconResult);

    // 5. Audit Agent Phase (compiles the chronological ledger timeline)
    const auditLog = await createAuditLog(taskId, intakeResult, docResult, reconResult, routingResult);

    // Combine into a master task object record
    const newTask = {
      task_id: taskId,
      source: source,
      status: reconResult.status === 'flagged' ? 'flagged' : 'approved',
      intake: intakeResult.output,
      document: docResult,
      reconciliation: reconResult,
      routing: routingResult,
      audit_log: auditLog
    };

    // Save to local runtime memory array
    globalTasks.unshift(newTask);

    // Return successful verification block back to frontend storefront
    return res.json({
      success: true,
      task: newTask
    });

  } catch (error) {
    console.error("Pipeline Processing Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Expose internal array out to dashboard global state routers
router.get('/summary', (req, res) => {
  const totalTasks = globalTasks.length;
  const flags = globalTasks.filter(t => t.status === 'flagged');
  
  const priorities = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  flags.forEach(t => {
    if (t.routing && priorities[t.routing.priority_label] !== undefined) {
      priorities[t.routing.priority_label]++;
    }
  });

  const aiAlerts = flags.map(t => ({
    task_id: t.task_id,
    type: t.reconciliation?.flags[0]?.type || 'EXCEPTION',
    message: t.reconciliation?.flags[0]?.detail || 'System flag raised.'
  }));

  res.json({
    total_tasks: totalTasks,
    priority_counts: priorities,
    total_flags: flags.length,
    ai_alerts: aiAlerts,
    tasks_list: globalTasks
  });
});

module.exports = router;
module.exports.globalTasks = globalTasks;