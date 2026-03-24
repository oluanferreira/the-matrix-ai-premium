/**
 * Terms of Use Acceptance Module
 *
 * Handles display, acceptance prompt, and persistence of
 * Terms of Use consent during The Matrix AI installation.
 *
 * @module terms-acceptance
 */

const path = require('path');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const { colors } = require('../utils/lmas-colors');

const TERMS_FILE = 'terms-accepted.json';
const TERMS_VERSION = '1.0';

/**
 * Check if terms have already been accepted in the given install directory.
 *
 * @param {string} installDir - Project root directory
 * @returns {Promise<boolean>} true if `.lmas/terms-accepted.json` exists with valid data
 */
async function checkTermsAccepted(installDir) {
  const termsPath = path.join(installDir, '.lmas', TERMS_FILE);

  try {
    if (await fse.pathExists(termsPath)) {
      const content = await fse.readFile(termsPath, 'utf8');
      const data = JSON.parse(content);

      if (data && data.accepted === true && data.version) {
        return true;
      }
    }
  } catch {
    // File missing or corrupt — treat as not accepted
  }

  return false;
}

/**
 * Display Terms of Use summary and prompt the user for explicit acceptance.
 * Exits the process if the user declines.
 *
 * @returns {Promise<void>} Resolves when accepted, exits process if declined
 */
async function promptTermsAcceptance() {
  console.log('\n' + colors.dim('━'.repeat(60)));
  console.log(colors.primary('\n📜 Termos de Uso — The Matrix AI\n'));

  console.log(colors.secondary('  Ao instalar o The Matrix AI, você concorda com os Termos de Uso:\n'));
  console.log(colors.dim('  • ') + 'Uso permitido: projetos pessoais e comerciais');
  console.log(colors.dim('  • ') + 'Uso proibido: copiar, redistribuir ou criar produto concorrente');
  console.log(colors.dim('  • ') + 'Propriedade intelectual: agentes, workflows e personas são protegidos');
  console.log(colors.dim('  • ') + 'Termos completos: docs/legal/TERMS-OF-USE.md\n');

  const { accepted } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'accepted',
      message: colors.primary('Você aceita os Termos de Uso? (s/n)'),
      default: false,
    },
  ]);

  if (!accepted) {
    console.log(colors.warning('\n⚠️  Instalação cancelada. O The Matrix AI requer aceite dos Termos de Uso.\n'));
    process.exit(0);
  }
}

/**
 * Save terms acceptance record to `.lmas/terms-accepted.json`.
 *
 * @param {string} installDir - Project root directory
 * @param {string} [tokenId] - Optional premium token ID, stored for audit trail
 * @returns {Promise<void>}
 */
async function saveTermsAcceptance(installDir, tokenId) {
  const lmasDir = path.join(installDir, '.lmas');
  const termsPath = path.join(lmasDir, TERMS_FILE);

  const record = {
    accepted: true,
    acceptedAt: new Date().toISOString(),
    version: TERMS_VERSION,
  };

  if (tokenId) {
    record.tokenId = tokenId;
  }

  await fse.ensureDir(lmasDir);
  await fse.writeFile(termsPath, JSON.stringify(record, null, 2) + '\n', 'utf8');
}

module.exports = {
  checkTermsAccepted,
  promptTermsAcceptance,
  saveTermsAcceptance,
};
