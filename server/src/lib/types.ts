export interface PostQuery {
    take: number,
    orderBy: { cursorId: 'asc' },
    skip?: number,
    cursor?: { cursorId: number },
    where?: { userId: string }
}

export interface CommentQuery {
    take: number,
    orderBy: { cursorId: 'asc' },
    skip?: number,
    cursor?: { cursorId: number },
    where?: { postId: string }
}

export type registerData = {
    firstName: string,
    lastName: string,
    username: string,
    password: string
}

export type loginData = {
    username: string,
    password: string
}