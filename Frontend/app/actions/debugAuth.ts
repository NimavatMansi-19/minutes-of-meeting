"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function debugAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return {
            message: "No Token Found in Cookies",
            tokenPresent: false
        };
    }

    try {
        const base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }

        const jsonPayload = Buffer.from(base64, 'base64').toString();
        const payload = JSON.parse(jsonPayload);

        const email = payload.email || payload.sub || payload.username;
        const id = payload.id || payload.staffId || payload.StaffID;
        const role = payload.role;

        let userFound = null;
        let lookupMethod = "None";

        if (id) {
            userFound = await prisma.staff.findUnique({ where: { StaffID: Number(id) } });
            lookupMethod = "ID: " + id;
        }

        if (!userFound && email) {
            userFound = await prisma.staff.findFirst({ where: { EmailAddress: email } });
            lookupMethod = "Email: " + email;
        }

        return {
            message: userFound ? "User Found" : "User Not Found in DB",
            tokenPresent: true,
            payload: payload,
            lookupMethod: lookupMethod,
            userFound: !!userFound,
            roleInToken: role,
            dbUser: userFound ? { StaffID: userFound.StaffID, Email: userFound.EmailAddress } : null
        };

    } catch (e: any) {
        return {
            message: "Error Decoding/Processing Token",
            error: e.message,
            stack: e.stack
        };
    }
}
