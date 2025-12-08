import { Buffer } from 'buffer';

export function encodeCursor(nextCursor: number) {
    return Buffer
        .from(String(nextCursor), 'utf8')
        .toString('base64');
}

export function decodeCursor(cursor: string) {
    return Number(
        Buffer.from(cursor, 'base64').toString('utf8')
    );

}