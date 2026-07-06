const express = require('express');
const router = express.Router();

router.get('/summary', (req, res) => {
  const tasks = global.tasks || [];

  // 1. Calculate Priority Breakdown Counts
  const priorityCounts = {
    CRITICAL: tasks.filter(t => t.routing?.priority_label === 'CRITICAL').length,
    HIGH: tasks.filter(t => t.routing?.priority_label === 'HIGH').length,
    MEDIUM: tasks.filter(t => t.routing?.priority_label === 'MEDIUM').length,
    LOW: tasks.filter(t => t.routing?.priority_label === 'LOW').length
  };

  // 2. Count Active Alert Flags
  const totalFlags = tasks.reduce((sum, t) => sum + (t.reconciliation?.flags?.length || 0), 0);

  // 3. Compile a quick list of top alerts to show on screen
  const alertsList = [];
  tasks.forEach(task => {
    task.reconciliation?.flags?.forEach(flag => {
      alertsList.push({
        task_id: task.task_id,
        type: flag.type,
        message: flag.detail
      });
    });
  });

  // 4. Send metrics to frontend
  res.json({
    total_tasks: tasks.length,
    priority_counts: priorityCounts,
    total_flags: totalFlags,
    ai_alerts: alertsList.slice(0, 5), // Send top 5 alerts
    tasks_list: [...tasks].reverse().slice(0, 10) // Send last 10 tasks (newest first)
  });
});

module.exports = router;