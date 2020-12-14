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
  bookService,
} = require("./helpers");

describe("Transaction test", () => {
  const baseUrl = "/transactions";

  beforeEach(async () => {
    await clearDatabase();
    await createDefaultCategories();
    await createDefaultPlans();
  });

  it("should create a transaction", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });
    const service = await createService(request, { token: token1, category, company });

    const userId = await createUser(request, { email: "abc@abc.com" });
    const { jwt: token2 } = await login(request, { email: "abc@abc.com" });

    const { body, status } = await request
      .post(`/services/${service.id}/book`)
      .set("Authorization", `Bearer ${token2}`)
      .send({
        companyId: company.id,
        value: service.value,
        time: "10:00",
        day: "14/12/2020",
      });

    expect(status).toBe(201);
    expect(body.seller.id).toBe(company.id);
    expect(body.buyer.id).toBe(userId);
    expect(body.service.id).toBe(service.id);

    done();
  });

  it("should get buyer transactions", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });
    const service = await createService(request, { token: token1, category, company });

    const buyerId = await createUser(request, { email: "abc@abc.com" });
    const { jwt: token2 } = await login(request, { email: "abc@abc.com" });

    await bookService(request, {
      company,
      service,
      token: token2,
      time: "10:00",
      day: "14/12/2020",
    });

    const { status, body } = await request.get(`${baseUrl}/buyer`).set("Authorization", `Bearer ${token2}`).send({});

    expect(status).toBe(200);
    expect(body.length).toBe(1);

    expect(body[0].seller.id).toBe(company.id);
    expect(body[0].buyer.id).toBe(buyerId);
    expect(body[0].service.id).toBe(service.id);

    done();
  });

  it("should get seller transactions", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });
    const service = await createService(request, { token: token1, category, company });

    const buyerId = await createUser(request, { email: "abc@abc.com" });
    const { jwt: token2 } = await login(request, { email: "abc@abc.com" });

    await bookService(request, {
      company,
      service,
      token: token2,
      time: "10:00",
      day: "14/12/2020",
    });

    const { status, body } = await request.get(`${baseUrl}/seller`).set("Authorization", `Bearer ${token1}`).send({});

    expect(status).toBe(200);
    expect(body.length).toBe(1);

    expect(body[0].seller.id).toBe(company.id);
    expect(body[0].buyer.id).toBe(buyerId);
    expect(body[0].service.id).toBe(service.id);

    done();
  });

  it("should delete a transaction", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });
    const service = await createService(request, { token: token1, category, company });

    await createUser(request, { email: "abc@abc.com" });
    const { jwt: token2 } = await login(request, { email: "abc@abc.com" });

    const transaction = await bookService(request, {
      company,
      service,
      token: token2,
      time: "10:00",
      day: "14/12/2020",
    });

    const { status } = await request
      .delete(`${baseUrl}/${transaction.id}`)
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(status).toBe(204);

    done();
  });

  it("should get all service transactions by day", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });
    const service = await createService(request, { token: token1, category, company });

    await createUser(request, { email: "abc@abc.com" });
    const { jwt: token2 } = await login(request, { email: "abc@abc.com" });

    const day = "14/12/2020";

    await bookService(request, {
      company,
      service,
      token: token2,
      time: "10:00",
      day,
    });

    const { status, body } = await request.get(`${baseUrl}?serviceId=${service.id}&day=${day}`).send({});

    expect(status).toBe(200);
    expect(body.length).toBe(1);

    done();
  });
});
