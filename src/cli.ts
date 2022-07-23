import ipi, { loadASNv4, loadASNv6, loadDump } from './index.js';
import { Command } from 'commander';
import ipaddr from 'ipaddr.js';

const program = new Command();

program
	.description('IP-Info cli')
	.argument('IP', 'IP address. Can be IPv4 or IPv6')
	.option(
		'--no-update-cache',
		`If cache shouldn't be updated. If cache doesn't exist, this option will be ignored.`
	)
	.action(async (ip: string, { updateCache }: { updateCache: boolean }) => {
		// only load necessary database
		const parsedIP = ipaddr.parse(ip);
		const promises = [
			loadDump(updateCache),
			parsedIP.kind() === 'ipv4'
				? loadASNv4(updateCache)
				: loadASNv6(updateCache),
		];
		await Promise.all(promises);
		console.log(await ipi(ip));
	});

program.parse(process.argv);
