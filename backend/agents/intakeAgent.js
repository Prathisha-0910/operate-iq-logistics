async function runIntakeAgent(message, documentText = '') {
  // Combine both texts so nothing gets missed!
  const combinedText = `${message} ${documentText || ''}`.toLowerCase();
  
  let taskType = 'query';
  let item = null;
  let quantity = 0;
  let customerName = "Unknown Entity";
  let urgencyKeywords = [];

  // 1. Scan combined text for structural markers
  if (combinedText.includes('invoice') || combinedText.includes('supplier') || combinedText.includes('total due') || combinedText.includes('inv-')) {
    taskType = 'invoice';
  } else if (combinedText.includes('order') || combinedText.includes('need') || combinedText.includes('buy')) {
    taskType = 'order';
  }

  if (combinedText.includes('cotton fabric') || combinedText.includes('blue')) {
    item = 'Cotton Fabric Blue';
  }

  const qtyMatch = combinedText.match(/(\d+)\s*(metres|metre|m\b|units|x)/);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  if (combinedText.includes('priya textiles')) {
    customerName = 'Priya Textiles';
  } else if (combinedText.includes('chennai textile mills') || combinedText.includes('chennai')) {
    customerName = 'Chennai Textile Mills';
  }

  if (combinedText.includes('urgent') || combinedText.includes('thursday') || taskType === 'invoice') {
    urgencyKeywords.push('priority_action');
  }

  return {
    agent: 'intake',
    status: 'completed',
    output: {
      task_type: taskType,
      raw_summary: message.length > 60 ? message.substring(0, 60) + '...' : message,
      item: item,
      quantity: quantity,
      customer_name: customerName,
      urgency_keywords: urgencyKeywords,
      deadline: combinedText.includes('thursday') ? 'Thursday Deliverable' : null
    }
  };
}

module.exports = { runIntakeAgent };