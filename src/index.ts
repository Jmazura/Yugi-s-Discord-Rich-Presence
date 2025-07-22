import RPC from 'discord-rpc';
import { exec } from 'child_process';

const clientId = '905458441831727155';
const rpc = new RPC.Client({ transport: 'ipc' });
RPC.register(clientId);

// Truncate helper
function truncate(text: string, max = 128): string {
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
}

// Sanitize ugly text
function cleanText(text: string): string {
  return text.replace(/\s*\(UNREGISTERED\)/gi, '').trim();
}

// Get active window title
function getWindowTitle(): Promise<string> {
  return new Promise((resolve) => {
    exec('xdotool getactivewindow getwindowname', (err, stdout) => {
      if (err || !stdout) return resolve('');
      resolve(cleanText(stdout.trim()));
    });
  });
}

// Get app name or class (like "sublime_text", "code", etc.)
function getWindowApp(): Promise<string> {
  return new Promise((resolve) => {
    exec('xdotool getactivewindow', (err, stdout) => {
      if (err || !stdout) return resolve('');
      const windowId = stdout.trim();
      exec(`xprop -id ${windowId} WM_CLASS`, (err2, stdout2) => {
        if (err2 || !stdout2) return resolve('');
        const match = stdout2.match(/"([^"]+)"\s*,\s*"([^"]+)"/);
        if (match) return resolve(match[2]); // Use the second value as app name
        return resolve('Unknown');
      });
    });
  });
}

let startTime = new Date();
let lastApp = '';

async function updatePresence() {
  const title = await getWindowTitle();
  const app = await getWindowApp();

  if (!title && !app) {
    console.log('🛑 No window detected');
    return;
  }

  if (app !== lastApp) {
    startTime = new Date(); // reset if user switches apps
  }
  
  rpc.setActivity({
    details: truncate(title || 'Working'),
    state: truncate("is on " +app || 'Unknown'),
    startTimestamp: startTime,
    largeImageKey: truncate(app || 'code'), // You can use a default fallback image
    largeImageText: truncate(app || 'Application'),
    instance: false,
  });

  console.log(`🎯 ${app} — ${title}`);
  lastApp = app;
}

rpc.on('ready', () => {
  console.log('🎮 Rich Presence connected');
  updatePresence();
  setInterval(updatePresence, 15_000); // every 15 seconds
});

rpc.login({ clientId }).catch((err) => {
  console.error('❌ Failed to login to RPC:', err.message);
});
