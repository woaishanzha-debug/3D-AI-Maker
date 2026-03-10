import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fixing existing invitation codes...');
        const codes = await (prisma as any).invitationCode.findMany();

        for (const code of codes) {
            const updates: any = {};

            // Set default status to ACTIVE if missing
            if (!code.status) {
                updates.status = 'ACTIVE';
            }

            // Generate initial password if TEACHER and missing
            if (code.type === 'TEACHER' && !code.initialPassword) {
                updates.initialPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
                console.log(`Generated password for ${code.code}: ${updates.initialPassword}`);
            }

            if (Object.keys(updates).length > 0) {
                await (prisma as any).invitationCode.update({
                    where: { id: code.id },
                    data: updates
                });
            }
        }

        console.log('Success! Existing codes updated.');
    } catch (e) {
        console.error('Error during update:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
