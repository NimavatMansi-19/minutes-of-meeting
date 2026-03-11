import { prisma } from "./lib/prisma";

async function listStaff() {
    try {
        const staff = await prisma.staff.findMany();
        console.log("Staff in DB:", JSON.stringify(staff, null, 2));
    } catch (e) {
        console.error("Error listing staff:", e);
    }
}

listStaff();
