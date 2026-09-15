const prisma = require('../lib/prisma');

class TimerService {
    /**
     * Create a new timer record and update user stats
     */
    async createTimerRecord(userId, data) {
        // data: { time: number (ms) }

        // 1. Verify input (basic)
        if (!data.time) {
            throw new Error('Time is required');
        }

        try {
            // Try transaction first
            return await this._createWithTransaction(userId, data);
        } catch (error) {
            // If transaction fails (P2028), use non-transactional approach
            if (error.code === 'P2028') {
                console.warn('Transaction failed, using non-transactional approach');
                return await this._createWithoutTransaction(userId, data);
            }
            throw error;
        }
    }

    async _createWithTransaction(userId, data) {
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
                        password: 'guest_password_placeholder',
                    }
                });
            }

            // Create TimerRecord
            const timerRecord = await tx.timerRecord.create({
                data: {
                    userId,
                    time: data.time
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

            return timerRecord;
        }, {
            maxWait: 10000,
            timeout: 20000,
        });
    }

    async _createWithoutTransaction(userId, data) {
        // Check if user exists, create if not
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            const randomSuffix = Math.random().toString(36).substr(2, 6);
            user = await prisma.user.create({
                data: {
                    id: userId,
                    username: `Guest_${randomSuffix}`,
                    email: `guest_${randomSuffix}@example.com`,
                    password: 'guest_password_placeholder',
                }
            });
        }

        // Create TimerRecord
        const timerRecord = await prisma.timerRecord.create({
            data: {
                userId,
                time: data.time
            }
        });

        // Update User Stats
        const updates = {
            totalSolves: { increment: 1 }
        };

        if (!user.bestSolve || data.time < user.bestSolve) {
            updates.bestSolve = data.time;
        }

        await prisma.user.update({
            where: { id: userId },
            data: updates
        });

        return timerRecord;
    }

    async getUserTimerRecords(userId, limit = 50, offset = 0) {
        return await prisma.timerRecord.findMany({
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

        return user;
    }
}

module.exports = new TimerService();
