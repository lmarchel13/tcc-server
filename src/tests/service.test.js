const supertest = require("supertest");
const moment = require("moment");
const mongoose = require("mongoose");

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

describe("Service test", () => {
  const baseUrl = "/services";
  const format = "DD/MM/YYYY";

  beforeEach(async () => {
    await clearDatabase();
    await createDefaultCategories();
    await createDefaultPlans();
  });

  it("should create a service", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    const payload = {
      name: "abc",
      description: "SomeServiceDescription",
      categoryId: category.id,
      duration: "00:30",
      type: "fixed",
      value: 100,
    };

    const { status, body } = await request
      .post(`/companies/${company.id}/services`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(status).toBe(201);
    expect(body).toBeDefined();
    expect(body.name).toBe("abc");

    done();
  });

  it("should update a service", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    const service = await createService(request, { token, category, company });

    const { id: serviceId } = service;
    delete service.id;
    delete service.company;
    delete service.category;

    const { status, body } = await request
      .patch(`/companies/${company.id}/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...service,
        name: "newname",
      });

    expect(status).toBe(200);
    expect(body.id).toBe(serviceId);
    expect(body.name).toBe("newname");

    done();
  });

  it("should get offers by day (today)", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    await createService(request, { token, category, company });
    await createService(request, { token, category, company });
    await createService(request, { token, category, company });
    await createService(request, { token, category, company });

    const { status, body } = await request.get(`${baseUrl}/offers`).send({});

    expect(status).toBe(200);
    expect(body.length).toBe(1);
    expect(body[0].services.length).toBe(4);

    done();
  });

  it("should search service by name", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    const { id: serviceId } = await createService(request, { token, category, company, name: "abc" });
    await createService(request, { token, category, company, name: "def" });

    const { status, body } = await request.get(`${baseUrl}/search?term=abc`).send({});

    expect(status).toBe(200);
    expect(body.length).toBe(1);
    expect(body[0].id).toBe(serviceId);

    done();
  });

  it("should get service by ID", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    const { id: serviceId } = await createService(request, { token, category, company, name: "abc" });

    const { status, body } = await request.get(`${baseUrl}/${serviceId}`).send({});

    expect(status).toBe(200);
    expect(body.id).toBe(serviceId);

    done();
  });

  it("should return 404 if service not found", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    const { status } = await request.get(`${baseUrl}/${mongoose.Types.ObjectId()}`).send({});

    expect(status).toBe(404);

    done();
  });

  it("delete a service", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token } = await login(request);
    const company = await createCompany(request, { plan, token });

    const { id: serviceId } = await createService(request, { token, category, company });

    const { status } = await request.delete(`${baseUrl}/${serviceId}`).set("Authorization", `Bearer ${token}`).send({});

    expect(status).toBe(204);

    done();
  });

  it("return 401 when deleting a service that does not belong to user", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });

    await createUser(request, { email: "someemail@email.com" });
    const { jwt: token2 } = await login(request, { email: "someemail@email.com", password: "123456" });

    const { id: serviceId } = await createService(request, { token: token1, category, company });

    const { status } = await request
      .delete(`${baseUrl}/${serviceId}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({});

    expect(status).toBe(401);

    done();
  });

  it("should book a service", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });

    await createUser(request, { email: "someemail@email.com" });
    const { jwt: token2 } = await login(request, { email: "someemail@email.com", password: "123456" });

    const { id: serviceId, value } = await createService(request, { token: token1, category, company });

    const payload = { companyId: company.id, value, time: "10:00", day: "14/12/2020" };
    const { status } = await request
      .post(`${baseUrl}/${serviceId}/book`)
      .set("Authorization", `Bearer ${token2}`)
      .send(payload);

    expect(status).toBe(201);

    done();
  });

  it("should return 400 when book an unavailable service", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });

    await createUser(request, { email: "someemail@email.com" });
    const { jwt: token2 } = await login(request, { email: "someemail@email.com", password: "123456" });

    const { id: serviceId, value } = await createService(request, { token: token1, category, company });

    const payload = { companyId: company.id, value, time: "10:00", day: "14/12/2020" };
    await request.post(`${baseUrl}/${serviceId}/book`).set("Authorization", `Bearer ${token2}`).send(payload);

    const { status } = await request
      .post(`${baseUrl}/${serviceId}/book`)
      .set("Authorization", `Bearer ${token2}`)
      .send(payload);

    expect(status).toBe(400);

    done();
  });
});
