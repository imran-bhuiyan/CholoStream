import { buildChannelsFromIptvOrg } from './src/lib/iptvOrg';

async function main() {
  try {
    const channels = await buildChannelsFromIptvOrg();
    const rtbGo = channels.find(c => c.id === 'rtb-go');
    console.log(JSON.stringify(rtbGo, null, 2));
    console.log("Total channels: ", channels.length);
  } catch (err) {
    console.error(err);
  }
}
main();
