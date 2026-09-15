const { PrismaClient } = require('@prisma/client');

// One client (and one connection pool) for the whole process.
module.exports = new PrismaClient();
