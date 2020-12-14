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

describe.only("Offer test", () => {
  const baseUrl = "/offers";

  beforeEach(async () => {
    await clearDatabase();
    await createDefaultCategories();
    await createDefaultPlans();
  });

  it("should get offers", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const company = await createCompany(request, { plan, token });

    await createService(request, { token, category, company });
    await createService(request, { token, category, company });
    await createService(request, { token, category, company });
    await createService(request, { token, category, company });

    const { status, body } = await request.get(baseUrl);

    expect(status).toBe(200);
    expect(body.length).toBe(4);

    done();
  });

  it("should get offers by name", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const company = await createCompany(request, { plan, token });

    await createService(request, { token, category, company, name: "abc" });
    await createService(request, { token, category, company, name: "def" });

    const { status, body } = await request.get(`${baseUrl}/search?q=abc`);

    expect(status).toBe(200);
    expect(body.length).toBe(1);

    done();
  });
});
