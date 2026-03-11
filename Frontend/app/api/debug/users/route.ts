import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const staff = await prisma.staff.findMany();
        return NextResponse.json({ count: staff.length, users: staff });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST() {
    try {
        const email = "admin@company.com";
        let user = await prisma.staff.findFirst({ where: { EmailAddress: email } });

        if (!user) {
            user = await prisma.staff.create({
                data: {
                    StaffName: "System Admin",
                    EmailAddress: email,
                    MobileNo: "9999999999",
                    Remarks: "Auto-created by debugger",
                    Created: new Date(),
                    Modified: new Date()
                }
            });
            return NextResponse.json({ message: "Admin user created", user });
        }

        return NextResponse.json({ message: "Admin user already exists", user });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
