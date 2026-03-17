#!/usr/bin/env node

/**
 * Register a second chat (private or group) to share the same agent instance as an existing group.
 *
 * Usage:
 *   node scripts/register-shared-channel.js <new-jid> <existing-folder>
 *
 * Example:
 *   # Register a private DingTalk chat to share the dingtalk_devteam agent
 *   node scripts/register-shared-channel.js "ding:cidPrivateXXX" "dingtalk_devteam"
 */

import { initDatabase, setRegisteredGroup } from '../dist/db.js';
import fs from 'fs';
import path from 'path';

const [newJid, existingFolder] = process.argv.slice(2);

if (!newJid || !existingFolder) {
  console.error('Usage: node scripts/register-shared-channel.js <new-jid> <existing-folder>');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/register-shared-channel.js "ding:cidPrivateXXX" "dingtalk_devteam"');
  process.exit(1);
}

// Validate folder exists
const folderPath = path.join(process.cwd(), 'groups', existingFolder);
if (!fs.existsSync(folderPath)) {
  console.error(`Error: Group folder '${existingFolder}' does not exist at ${folderPath}`);
  console.error('');
  console.error('Available groups:');
  const groupsDir = path.join(process.cwd(), 'groups');
  if (fs.existsSync(groupsDir)) {
    const groups = fs.readdirSync(groupsDir).filter(name => {
      const stats = fs.statSync(path.join(groupsDir, name));
      return stats.isDirectory();
    });
    groups.forEach(g => console.error(`  - ${g}`));
  }
  process.exit(1);
}

initDatabase();

try {
  setRegisteredGroup(newJid, {
    name: `Shared: ${existingFolder}`,
    folder: existingFolder,
    trigger: '@Andy',
    added_at: new Date().toISOString(),
    requiresTrigger: true,
    privilegedAccess: false,
  });

  console.log('✅ Successfully registered shared channel');
  console.log('');
  console.log('Configuration:');
  console.log(`  Chat JID:      ${newJid}`);
  console.log(`  Agent Folder:  groups/${existingFolder}/`);
  console.log(`  Trigger:       @Andy`);
  console.log('');
  console.log('Both channels will now route to the same agent instance.');
  console.log('They will share the same memory, filesystem, and conversation context.');
} catch (err) {
  console.error('❌ Failed to register shared channel:', err.message);
  process.exit(1);
}
