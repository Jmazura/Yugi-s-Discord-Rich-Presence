import RPC from 'discord-rpc';

console.log("Connecting...");

const clientId = '905458441831727155'; 
RPC.register(clientId);

const rpc = new RPC.Client({ transport: 'ipc' });

rpc.on('ready', () => {
  rpc.setActivity({
    details: 'Coding like a beast 🔥',
    state: 'Powered by Yugiboyy',
    startTimestamp: new Date(),
    largeImageKey: 'large_image', // match your uploaded asset name (no extension)
    largeImageText: 'Azura Mode',
    smallImageKey: 'small_icon',
    smallImageText: 'RPC Life',
    instance: false,
    buttons: [
      { label: 'Follow Yugiboyy', url: 'https://github.com/YOUR_USERNAME' }
    ]
  });

  console.log('✅ Activites Live on Discord!');
});

rpc.login({ clientId }).catch((err: Error) => {
  console.error('❌ Failed to log in to Discord RPC:', err.message);
});
