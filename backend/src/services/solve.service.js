const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SolveService {
    /**
     * Create a new solve record and update user stats
     */
    async createSolve(userId, data) {
        // data: { time: number (ms), scramble: string, moveCount?: number }

        // 1. Verify input (basic)
        if (!data.time || !data.scramble) {
            throw new Error('Time and scramble are required');
        }

        // 2. Transaction to ensure stats are synced
        return await prisma.$transaction(async (tx) => {
            // Check if user exists, create if not (for demo/guest mode)
            let user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) {
                // Generate dummy credentials for guest
                const randomSuffix = Math.random().toString(36).substr(2, 6);
                user = await tx.user.create({
                    data: {
                        id: userId,
                        username: `Guest_${randomSuffix}`,
                        email: `guest_${randomSuffix}@example.com`,
                        password: 'guest_password_placeholder', // Should be hashed in real app
                    }
                });
            }

            // Create Solve
            const solve = await tx.solve.create({
                data: {
                    userId,
                    time: data.time,
                    scramble: data.scramble,
                    moveCount: data.moveCount || 0,
                    isValid: true
                }
            });

            // Update User Stats
            const updates = {
                totalSolves: { increment: 1 }
            };

            // Update best solve if better (or if first solve)
            if (!user.bestSolve || data.time < user.bestSolve) {
                updates.bestSolve = data.time;
            }

            await tx.user.update({
                where: { id: userId },
                data: updates
            });

            return solve;
        });
    }

    async getUserSolves(userId, limit = 50, offset = 0) {
        return await prisma.solve.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            skip: Number(offset)
        });
    }

    async getStats(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { totalSolves: true, bestSolve: true }
        });

        // TODO: Calc averages (AO5, AO12) dynamically if needed
        return user;
    }
}

module.exports = new SolveService();
