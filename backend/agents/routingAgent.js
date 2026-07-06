function runRoutingAgent(intakeResult, reconciliationResult) {
  const taskType = intakeResult.output.task_type;
  const urgencyKeywords = intakeResult.output.urgency_keywords || [];
  
  // Default routing parameters
  let team = 'Support';
  let assignedTo = 'Kumar';
  let priorityLabel = 'LOW';
  let deadline = 'Standard (48h)';

  // 1. Route based on structural task classification
  if (taskType === 'invoice') {
    team = 'Finance';
    assignedTo = 'Divya';
    priorityLabel = 'MEDIUM';
    deadline = 'End of Week';
  } else if (taskType === 'order') {
    team = 'Operations';
    assignedTo = 'Ravi';
    priorityLabel = 'HIGH';
    deadline = 'Next-Day Dispatch';
  }

  // 2. Escalate Priority if urgency keywords or exceptions are detected
  if (urgencyKeywords.includes('priority_action') || urgencyKeywords.includes('urgent_deadline')) {
    priorityLabel = 'HIGH';
    deadline = 'Urgent (Same Day)';
  }

  // 3. Absolute Maximum Escalation: Critical supply warnings or high-level risk flags
  if (reconciliationResult && reconciliationResult.flags && reconciliationResult.flags.length > 0) {
    priorityLabel = 'CRITICAL';
    deadline = 'Immediate (Expedite)';
  }

  return {
    agent: 'routing',
    status: 'completed',
    team,
    assigned_to: assignedTo,
    priority_label: priorityLabel,
    deadline
  };
}

module.exports = { runRoutingAgent };