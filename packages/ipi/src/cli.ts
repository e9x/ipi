import ipi from "./index.js";
import { Command } from "commander";

const program = new Command();

program
  .description("IP-Info cli")
  .argument("IP", "IP address. Can be IPv4 or IPv6")
  .action(async (ip: string) => {
    try {
      const info = ipi(ip);
      console.log(info);
    } catch (error) {
      console.error(error);
    }
  });

program.parse(process.argv);
