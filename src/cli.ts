#!/usr/bin/env node
import ipi, { openDatabases } from './index.js';
import { Command } from 'commander';

const program = new Command();

program
	.description('IP-Info cli')
	.argument('IP', 'IP address. Can be IPv4 or IPv6')
	.option(
		'--no-update-cache',
		`If cache shouldn't be updated. If cache doesn't exist, this option will be ignored.`
	)
	.action(async (ip: string, { updateCache }: { updateCache: boolean }) => {
		await openDatabases(updateCache);
		console.log(ipi(ip));
	});

program.parse(process.argv);
