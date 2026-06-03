// AUTO-ASSIGN ENGINE
// ==================
// This answers one question: "Who should handle this ticket?"
//
// The logic works in 3 steps:
// Step 1 — Look at the category → find the right TEAM
// Step 2 — Look at the priority → pick the right AGENT
//          Critical = least busy agent (don't pile on one person)
//          Everything else = round robin (take turns fairly)
// Step 3 — Return that agent so the ticket can be assigned

const db = require('../db/database');

// RULE TABLE 1: Which team handles which category?
// To add a new category, just add a line here — nothing else changes
const CATEGORY_TO_TEAM = {
  network:  'network',
  hardware: 'hardware',
  software: 'software',
  other:    'software',  // fallback — software team handles unknowns
};

// RULE TABLE 2: SLA hours — how long before a ticket escalates
// These are real industry standard response times
const SLA_HOURS = {
  critical: 2,
  high:     8,
  medium:   24,
  low:      48,
};

// MAIN FUNCTION
// Called every time a new ticket is submitted
// Returns the agent object { id, name, email } or null if no agents exist
function assignTicket(category, priority) {

  // Step 1: find the right team for this category
  const team = CATEGORY_TO_TEAM[category] || 'software';

  // Step 2: get all agents on that team from the database
  const agents = db.prepare(
    `SELECT id, name, email FROM users WHERE role = 'agent' AND team = ?`
  ).all(team);

  // No agents on that team? Fall back to ANY agent in the system
  if (agents.length === 0) {
    const anyAgent = db.prepare(
      `SELECT id, name, email FROM users WHERE role = 'agent' LIMIT 1`
    ).get();
    return anyAgent || null;
  }

  // Step 3: pick the agent based on priority
  if (priority === 'critical') {
    // Critical tickets go to whoever has the LEAST open tickets right now
    // We don't want to pile critical work on an already busy agent
    return getLeastBusyAgent(agents);
  } else {
    // Everything else uses round-robin — agents take turns
    // This distributes work evenly over time
    return getRoundRobinAgent(agents);
  }
}

// LEAST BUSY: count each agent's open tickets, return the one with fewest
function getLeastBusyAgent(agents) {
  let leastBusy = agents[0];
  let lowestCount = Infinity;

  for (const agent of agents) {
    const result = db.prepare(
      `SELECT COUNT(*) as count FROM tickets
       WHERE assigned_to = ? AND status NOT IN ('resolved', 'closed')`
    ).get(agent.id);

    const count = result.count || 0;
    if (count < lowestCount) {
      lowestCount = count;
      leastBusy = agent;
    }
  }

  return leastBusy;
}

// ROUND ROBIN: find which agent was assigned a ticket least recently
// The agent who went the longest without a ticket gets the next one
function getRoundRobinAgent(agents) {
  const agentIds = agents.map(a => a.id);

  for (const agent of agents) {
    // Has this agent ever been assigned a ticket?
    const hasTickets = db.prepare(
      `SELECT id FROM tickets WHERE assigned_to = ? LIMIT 1`
    ).get(agent.id);

    // If not — they go first (never been assigned = highest priority)
    if (!hasTickets) return agent;
  }

  // All agents have tickets — find who was assigned one longest ago
  const placeholders = agentIds.map(() => '?').join(',');
  const result = db.prepare(
    `SELECT assigned_to FROM tickets
     WHERE assigned_to IN (${placeholders})
     GROUP BY assigned_to
     ORDER BY MAX(created_at) ASC
     LIMIT 1`
  ).get(agentIds);

  // Return that agent
  return agents.find(a => a.id === result?.assigned_to) || agents[0];
}

module.exports = { assignTicket, SLA_HOURS };