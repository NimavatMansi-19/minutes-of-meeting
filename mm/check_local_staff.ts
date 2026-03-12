
import { PrismaClient } from './app/generated/prisma/client';
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const adapter = new PrismaMariaDb({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
    });
    const prisma = new PrismaClient({ adapter });
    const staff = await prisma.staff.findMany();
    console.log('Staff in local DB:');
    staff.forEach(s => console.log(`- ${s.StaffName} (${s.EmailAddress}) ID: ${s.StaffID}`));
}

main();
