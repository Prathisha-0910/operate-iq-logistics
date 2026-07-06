function createAuditLog(taskId, intakeResult, docResult, reconResult, routingResult) {
  const timeline = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Log Intake Step
  timeline.push({
    time: now,
    agent: 'Intake Agent',
    event: `Business event captured via system entry. Classification: ${intakeResult?.output?.task_type?.toUpperCase() || 'UNKNOWN'}.`
  });

  // 2. Log Document Intel Step (if it ran)
  if (docResult) {
    timeline.push({
      time: now,
      agent: 'Document Intelligence Agent',
      event: `Extracted data from ${docResult.extracted_data?.supplier_name || 'Document'}. Total amount: ₹${docResult.extracted_data?.total_amount || 0}.`
    });
  }

  // 3. Log Reconciliation & Stock verification safely
  if (reconResult) {
    if (reconResult.status === 'flagged' && reconResult.flags && Array.isArray(reconResult.flags)) {
      reconResult.flags.forEach(flag => {
        timeline.push({
          time: now,
          agent: 'Reconciliation Agent',
          event: `⚠️ Exception Flag Raised: ${flag.detail}`
        });
      });
    } else {
      timeline.push({
        time: now,
        agent: 'Reconciliation Agent',
        event: `Inventory level checked. Workflow auto-approved and synchronized with stock records.`
      });
    }
  }

  // 4. Log Routing Step
  if (routingResult) {
    timeline.push({
      time: now,
      agent: 'Routing Agent',
      event: `Task successfully dispatched to ${routingResult.assigned_to} (${routingResult.team}) — Priority: ${routingResult.priority_label}.`
    });
  }

  return {
    task_id: taskId,
    timeline: timeline
  };
}

module.exports = { createAuditLog };