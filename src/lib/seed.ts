import { faker } from '@faker-js/faker'
import envConf from './envConfig.ts';
import bcrypt from 'bcryptjs';


const SALT = envConf.SALT;

export async function createRandomUser() {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: faker.internet.username(),
        passwordHash: await bcrypt.hash("Test@123", SALT),
        bio: faker.person.bio()
    }
}

export function createPost() {
    return faker.lorem.lines(3)
}