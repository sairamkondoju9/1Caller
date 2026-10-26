console.error('Phone-number purge is disabled. The previous script deleted inventory by substring and inserted an unverified active number. Review and remove records using an explicit, reviewed migration.');
process.exitCode = 1;
