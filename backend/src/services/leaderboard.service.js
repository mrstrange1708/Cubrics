const prisma = require('../lib/prisma');

class LeaderboardService {
    async getGlobalLeaderboard(limit = 100) {
        return await prisma.user.findMany({
            where: {
                bestSolve: { not: null }
            },
            orderBy: {
                bestSolve: 'asc'
            },
            take: Number(limit),
            select: {
                id: true,
                username: true,
                avatar: true,
                bestSolve: true,
                totalSolves: true
            }
        });
    }

    async getUserRankAndPercentile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { bestSolve: true }
        });

        if (!user || user.bestSolve === null) {
            return { rank: null, percentile: null };
        }

        // Users with a better (lower) time, and total ranked users
        const [betterCount, totalCount] = await Promise.all([
            prisma.user.count({ where: { bestSolve: { lt: user.bestSolve } } }),
            prisma.user.count({ where: { bestSolve: { not: null } } })
        ]);

        const rank = betterCount + 1;

        // Percentile calculation: 
        // We want "Top X%". 
        // If Rank 1 of 100 -> 1%. 
        // Calculation: (Rank / Total) * 100.
        // We ensure at least "Top 1%" if they are ranked.
        let percentile = Math.ceil((rank / totalCount) * 100);

        return {
            rank,
            totalPlayers: totalCount,
            percentile, // integer, e.g. 5 means "Top 5%"
            bestSolve: user.bestSolve
        };
    }
}

module.exports = new LeaderboardService();
