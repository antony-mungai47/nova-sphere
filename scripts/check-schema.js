const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const prod = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Product'`;
        console.log("Product columns:", prod.map(p => p.column_name));
        
        const order = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Order'`;
        console.log("Order columns:", order.map(p => p.column_name));
        
        const ticket = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'SupportTicket'`;
        console.log("Ticket columns:", ticket.map(p => p.column_name));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
