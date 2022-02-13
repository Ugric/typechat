import supertest from "supertest";
import server from "./server";

const app = supertest(server);

describe('User API', () => {
    it('should return users which have been created', async () => {
        const resp = await app.post('/api/user/1')
        expect(resp.status).toBe(200);
        const resp2 = await app.get('/api/user-data/1')
        expect(resp2.body).toEqual({ name: '1' });
    })
    it(
        'should return 404 if user is not found',
        async () => {
            const resp = await app.get('/api/user-data/2')
            expect(resp.status).toBe(404);
        }
    )
})