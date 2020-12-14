const supertest = require("supertest");

const app = require("../app");
const request = supertest(app);

const {
  clearDatabase,
  createDefaultCategories,
  createDefaultPlans,
  createUser,
  createCompany,
  login,
  createService,
} = require("./helpers");

describe.only("Plan test", () => {
  const baseUrl = "/plans";

  beforeEach(async () => {
    await clearDatabase();
    await createDefaultCategories();
    await createDefaultPlans();
  });

  it("should get plans", async (done) => {
    const { status, body } = await request.get(baseUrl);

    expect(status).toBe(200);
    expect(body.length).toBe(3);

    done();
  });

  it("should create a plan", async (done) => {
    const { status, body } = await request.post(baseUrl).send({
      name: "newplan",
      value: 100,
    });

    expect(status).toBe(201);
    expect(body.name).toBe("newplan");
    expect(body.value).toBe(100);

    done();
  });
});
