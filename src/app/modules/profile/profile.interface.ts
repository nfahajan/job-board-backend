import { User } from "@prisma/client";

export type ProfileData = {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    bio?: string;
    userId: string;
    user: User;
};
