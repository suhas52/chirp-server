import { configDotenv } from "dotenv";
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { prisma } from "../generated/prisma/prisma";

configDotenv();
const SECRET = String(process.env.JWT_SECRET)
if (!SECRET) throw new Error("Please ensure the JWT_SECRET exists in your environment")

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET,
};

passport.use(
    new Strategy(opts, async (payload, done) => {
        try {
            const user = prisma.user.findUnique({
                where: {id: payload.id}
            })
            if (user) return done(null, user);
        } catch (err) {
            return done(err)
        }
    })
)