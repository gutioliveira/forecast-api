import { Beach } from "@src/models/beach";

describe('Beach functional tests', () => {

  beforeAll(async () => {
    await Beach.deleteMany({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when creating a new beach', () => {
    it('should return a beach', async () => {
      const newBeach = {
        name: 'Name',
        position: 'S',
        lat: 10.00,
        lng: 10.00,
      };
      const { body, status } = await global.testRequest.post('/beach', ).send(newBeach);
      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newBeach));
    });

    it('should throw 422 when there is a validation error', async () => {
      const newBeach = {
        name: 'Name',
        position: 'S',
        lat: 'invalid value',
        lng: 10.00,
      };
      const { body, status } = await global.testRequest.post('/beach', ).send(newBeach);
      expect(status).toBe(422);
      expect(body).toEqual({error: 'Beach validation failed: lat: Cast to Number failed for value "invalid value" (type string) at path "lat"'});
    });

    it('should throw 500 when there is an unexpected error', async () => {
      const newBeach = {
        name: 'Name',
        position: 'S',
        lat: 10.00,
        lng: 10.00,
      };
      jest.spyOn(Beach.prototype, 'save')
        .mockImplementationOnce(() => Promise.reject('Fails'))
      const { body, status } = await global.testRequest.post('/beach', ).send(newBeach);
      expect(status).toBe(500);
      expect(body).toEqual({error: 'Internal Server Error'});
    });
  });
});
