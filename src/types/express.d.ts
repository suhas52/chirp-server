import 'express'
import { type decodedUser } from '../lib/types.ts'

declare module "express-serve-static-core" {
    interface Request {
        decodedUser?: decodedUser;
    }
}