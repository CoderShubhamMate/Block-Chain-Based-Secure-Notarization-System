const { connectBNB } = require('./src/blockchain/connection');
connectBNB().then(({ contract, provider }) => {
  const iface = contract.interface;
  const events = iface.fragments.filter(f => f.type === 'event');
  console.log('EVENTS:', JSON.stringify(events.map(f => f.format('full')), null, 2));
  // Also try to query recent logs
  provider.getBlockNumber().then(bn => {
    console.log('Current block:', bn);
    const fromBlock = bn - 5000;
    console.log('Querying from block:', fromBlock);
  });
}).catch(e => console.error('ERROR:', e.message));
