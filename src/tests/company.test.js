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
} = require("./helpers");

describe.only("Company test", () => {
  const baseUrl = "/companies";

  beforeEach(async () => {
    await clearDatabase();
    await createDefaultCategories();
    await createDefaultPlans();
  });

  it("should create a company", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const userId = await createUser(request);

    const { jwt: token } = await login(request);

    const company = await createCompany(request, { plan, token });

    expect(company).toBeDefined();
    expect(company.name).toBe("SomeCompany");
    expect(company.user.id).toBe(userId);
    expect(company.plan.id).toBe(plan.id);

    done();
  });

  it("should get company by id", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];
    const userId = await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    const { body, status } = await request.get(`/companies/${company.id}`);

    expect(status).toBe(200);
    expect(body.id).toBe(company.id);
    expect(body.name).toBe(company.name);
    expect(body.user.id).toBe(userId);

    done();
  });

  it("should retrieve all companies", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const userId = await createUser(request);

    const { jwt: token } = await login(request);

    const company1 = await createCompany(request, { plan, token });
    const company2 = await createCompany(request, { plan, token });

    const { body } = await request.get("/companies");

    expect(body.length).toBe(2);
    expect(body[0].id).toBe(company1.id);
    expect(body[1].id).toBe(company2.id);

    done();
  });

  it("update a company", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];
    const userId = await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    const { body, status } = await request
      .patch(`/companies/${company.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "new name" });

    expect(status).toBe(200);
    expect(body.id).toBe(company.id);
    expect(body.name).toBe("new name");
    expect(body.user.id).toBe(userId);

    done();
  });

  it("delete a company", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];
    const userId = await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    const { body, status } = await request
      .delete(`/companies/${company.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(status).toBe(204);

    done();
  });

  it("should retrieve user companies", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const userId = await createUser(request);

    const { jwt: token } = await login(request);

    const company1 = await createCompany(request, { plan, token });
    const company2 = await createCompany(request, { plan, token });
    const company3 = await createCompany(request, { plan, token });

    const { body } = await request.get("/companies/my-companies").set("Authorization", `Bearer ${token}`);

    expect(body.length).toBe(3);

    expect(body[0].id).toBe(company1.id);
    expect(body[1].id).toBe(company2.id);
    expect(body[2].id).toBe(company3.id);

    done();
  });
});
