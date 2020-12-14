const { after } = require("lodash");
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

describe("Category test", () => {
  const baseUrl = "/categories";

  beforeEach(async () => {
    await clearDatabase();
    await createDefaultCategories();
    await createDefaultPlans();
  });

  it("Get all categories should return default categories", async (done) => {
    const { body, status } = await request.get(baseUrl);

    expect(body).toBeDefined();
    expect(status).toBe(200);
    expect(body.length).toBeGreaterThan(0);

    done();
  });

  it("Create a new category", async (done) => {
    const payload = {
      name: "SomeCategory",
      icon: "SomeIcon",
    };
    const { status, body } = await request.post(baseUrl, payload);

    expect(body).toBeDefined();
    expect(status).toBe(201);
    expect(body.id).toBeDefined();

    done();
  });

  it("Get services by category", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const company = await createCompany(request, { plan, token });

    const { body: categories } = await request.get(baseUrl);
    const category = categories[0];

    const service = await createService(request, { token, category, company });

    const { body } = await request.get(`${baseUrl}/${category.id}/services`);

    expect(body).toBeDefined();
    expect(body[0].id).toBe(service.id);
    expect(body[0].name).toBe(service.name);
    expect(body[0].company.id).toBe(company.id);
    expect(body[0].category).toBe(category.id);

    done();
  });
});
