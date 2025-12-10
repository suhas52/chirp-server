import envConf from "../lib/envConfig.ts";
import jwt from 'jsonwebtoken';

const jwtSecret = envConf.JWT_SECRET;

type jwtUser = {
    id: string,
    username: string
}

export const signJwt = (user: jwtUser) => {
    const accessToken = jwt
        .sign({ id: user.id, username: user.username }, jwtSecret, {
            expiresIn: 7 * 24 * 60 * 60,

        })
    return accessToken;
}