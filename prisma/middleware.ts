import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
    const result = await next(params);

    if (params.model === 'Items' && (params.action === 'update' || params.action === 'create' || params.action === 'delete')) {
        // Mettre à jour le total de l'item
        if (params.args.where?.id) {
            const itemId = params.args.where.id;
            await updateItemTotal(itemId);
        }
    }

    return result;
});

async function updateItemTotal(itemId: string) {
    const item = await prisma.items.findUnique({
        where: { id: itemId },
        select: { quantity: true, unitPrice: true }
    });

    if (item) {
        const updatedTotal = (item.quantity || 0) * (item.unitPrice || 0);
        await prisma.items.update({
            where: { id: itemId },
            data: { itemsTotal: updatedTotal }
        });
    }
}

export default prisma;
