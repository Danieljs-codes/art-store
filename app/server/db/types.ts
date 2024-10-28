import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type account = {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    expiresAt: Timestamp | null;
    password: string | null;
};
export type artist = {
    id: string;
    name: string;
    bio: string;
    portfolioUrl: string | null;
    paystackSubAccountId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    userId: string;
};
export type session = {
    id: string;
    expiresAt: Timestamp;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
};
export type user = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};
export type verification = {
    id: string;
    identifier: string;
    value: string;
    expiresAt: Timestamp;
};
export type DB = {
    account: account;
    artist: artist;
    session: session;
    user: user;
    verification: verification;
};
