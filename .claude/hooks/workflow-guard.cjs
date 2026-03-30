/**
 * Workflow Fidelity Guard (CONSTITUTION_RULE_7)
 *
 * PreToolUse hook that blocks Edit/Write operations when an active workflow
 * has not completed all verification phases (e.g., Smith review).
 *
 * Reads workflow state from .lmas/.workflow-state.json:
 * {
 *   "active": true,
 *   "workflow": "repo-absorption",
 *   "current_phase": 3,
 *   "total_phases": 6,
 *   "implement_phase": 5,
 *   "verify_phase": 6,
 *   "verified": false,
 *   "started_at": "2026-03-29T...",
 *   "agents_activated": ["analyst", "ux-design-expert"]
 * }
 *
 * RULES:
 * - If no workflow state file → allow (no active workflow)
 * - If workflow.active && !workflow.verified && current_phase < implement_phase → BLOCK edits to .synapse/, .lmas-core/
 * - ZERO console.log (except the block message via stdout)
 * - NEVER fail visibly — all errors exit 0
 *
 * HOW AGENTS USE THIS:
 * - Morpheus writes .lmas/.workflow-state.json when starting a workflow
 * - Each agent updates current_phase after completing their phase
 * - Smith sets verified=true after emitting verdict
 * - Morpheus sets active=false after implementation + report
 */

const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const STATE_FILE = path.join(PROJECT_ROOT, '.lmas', '.workflow-state.json');

// Protected paths that cannot be edited during unverified workflow
const PROTECTED_PREFIXES = [
  '.synapse/',
  '.lmas-core/development/agents/',
  '.lmas-core/data/',
  'framework/references/',
];

// Always allowed (workflow state management, memories, handoffs)
const ALWAYS_ALLOWED = [
  '.lmas/.workflow-state.json',
  '.lmas/handoffs/',
  '.lmas/.session-id',
  '.lmas/.ctx-session',
  '.lmas/.activity-buffer',
];

function main() {
  try {
    // Read tool input from stdin
    const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
    const toolName = input.tool_name || '';

    // Only guard Edit and Write operations
    if (toolName !== 'Edit' && toolName !== 'Write') {
      return; // allow
    }

    // Check if workflow state exists
    if (!fs.existsSync(STATE_FILE)) {
      return; // no active workflow, allow
    }

    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

    // If no active workflow or already verified, allow
    if (!state.active || state.verified) {
      return; // allow
    }

    // Get the file being edited
    const filePath = input.tool_input?.file_path || '';
    const relativePath = filePath.replace(/\\/g, '/').replace(PROJECT_ROOT.replace(/\\/g, '/') + '/', '');

    // Check if file is always allowed
    for (const allowed of ALWAYS_ALLOWED) {
      if (relativePath.startsWith(allowed)) {
        return; // allow
      }
    }

    // Check if file is in protected paths
    let isProtected = false;
    for (const prefix of PROTECTED_PREFIXES) {
      if (relativePath.startsWith(prefix)) {
        isProtected = true;
        break;
      }
    }

    if (!isProtected) {
      return; // not a protected path, allow
    }

    // BLOCK: active workflow, not verified, editing protected path
    const phase = state.current_phase || '?';
    const total = state.total_phases || '?';
    const workflow = state.workflow || 'unknown';

    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason: `CONSTITUTION_RULE_7 (Workflow Fidelity): Workflow "${workflow}" ativo (phase ${phase}/${total}), verificacao NAO concluida. Editar arquivos protegidos BLOQUEADO ate Smith emitir veredito. Use: fs.writeFileSync('.lmas/.workflow-state.json', ...) para atualizar estado do workflow.`
    }));
  } catch {
    // Silent failure — never block on error
  }
}

main();
