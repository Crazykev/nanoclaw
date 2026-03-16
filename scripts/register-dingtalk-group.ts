import { initDatabase, setRegisteredGroup } from '../src/db.js';
import { ASSISTANT_NAME } from '../src/config.js';
import fs from 'fs';
import path from 'path';

// Initialize database
initDatabase();

// Register the DingTalk devteam group
const jid = 'ding:cidMjdUG8vu3oB9CVYcUY2SUQ==';
const group = {
  name: 'devteam',
  folder: 'dingtalk_devteam',
  trigger: `@${ASSISTANT_NAME}`,
  added_at: new Date().toISOString(),
  requiresTrigger: true,
};

setRegisteredGroup(jid, group);

// Create group folder
const groupDir = path.join(process.cwd(), 'groups', group.folder);
fs.mkdirSync(path.join(groupDir, 'logs'), { recursive: true });

console.log('✅ Registered DingTalk group:');
console.log(`   JID: ${jid}`);
console.log(`   Name: ${group.name}`);
console.log(`   Folder: ${group.folder}`);
console.log(`   Trigger: ${group.trigger}`);
console.log('');
console.log('📁 Group folder created at:', groupDir);
console.log('');
console.log('✨ You can now @机器人 in the DingTalk group to chat!');
