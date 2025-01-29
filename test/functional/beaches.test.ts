import { Beach } from '@src/models/beach';

describe('Beach functional tests', () => {
  beforeAll(async () => {
    await Beach.deleteMany({});
  });
  describe('When creating a beach', () => {
    it('should create a beach successfully', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };
      const response = await global.testRequest.post('/beaches').send(newBeach);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });

    it('should throw 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };
      const response = await global.testRequest.post('/beaches').send(newBeach);
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error:
          'Beach validation failed: lat: Cast to Number failed for value \"invalid\" (type string) at path \"lat\"',
      });
    });

    it('should throw 500 when there is an unexpected error', async () => {
      jest
        .spyOn(Beach.prototype, 'save')
        .mockRejectedValueOnce('fail to create beach');
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };
      const response = await global.testRequest.post('/beaches').send(newBeach);
      expect(response.status).toBe(500);
    });
  });
});
