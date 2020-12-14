const supertest = require("supertest");
const moment = require("moment");

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

describe("Report test", () => {
  const baseUrl = "/reports";
  const format = "DD/MM/YYYY";

  beforeEach(async () => {
    await clearDatabase();
    await createDefaultCategories();
    await createDefaultPlans();
  });

  it("should get report for last year", async (done) => {
    const name = "LAST_YEAR";

    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    // owner
    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });
    const service = await createService(request, { token: token1, category, company });

    // user
    await createUser(request, { email: "someemail@email.com" });
    const { jwt: token2 } = await login(request, { email: "someemail@email.com" });

    await bookService(request, {
      company,
      service,
      token: token2,
      time: "10:00",
      day: moment().format(format),
    });

    const { status, body } = await request
      .get(`${baseUrl}?name=${name}`)
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(status).toBe(200);
    expect(body.length).toBe(1);

    done();
  });

  it("should get report for last six months", async (done) => {
    const name = "LAST_6M";

    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    // owner
    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });
    const service = await createService(request, { token: token1, category, company });

    // user
    await createUser(request, { email: "someemail@email.com" });
    const { jwt: token2 } = await login(request, { email: "someemail@email.com" });

    await bookService(request, {
      company,
      service,
      token: token2,
      time: "10:00",
      day: moment().format(format),
    });

    const { status, body } = await request
      .get(`${baseUrl}?name=${name}`)
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(status).toBe(200);
    expect(body.length).toBe(1);

    done();
  });

  it("should get report per companies", async (done) => {
    const name = "PER_COMPANY";

    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    // owner
    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company1 = await createCompany(request, { plan, token: token1, name: "SomeCompany1" });
    const company2 = await createCompany(request, { plan, token: token1, name: "SomeCompany2" });
    const service1 = await createService(request, { token: token1, category, company: company1 });
    const service2 = await createService(request, { token: token1, category, company: company2 });

    // user
    await createUser(request, { email: "someemail@email.com" });
    const { jwt: token2 } = await login(request, { email: "someemail@email.com" });

    await bookService(request, {
      company: company1,
      service: service1,
      token: token2,
      time: "10:00",
      day: moment().format(format),
    });

    await bookService(request, {
      company: company2,
      service: service2,
      token: token2,
      time: "10:00",
      day: moment().format(format),
    });

    const { status, body } = await request
      .get(`${baseUrl}?name=${name}`)
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(status).toBe(200);
    expect(body.length).toBe(2);
    expect(body[0].label).toBe("SomeCompany1");
    expect(body[0].value).toBe(1);
    expect(body[1].label).toBe("SomeCompany2");
    expect(body[1].value).toBe(1);

    done();
  });

  it("should get report per category", async (done) => {
    const name = "PER_CATEGORY";

    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category1 = categories[0];
    const category2 = categories[1];

    // owner
    await createUser(request);
    const { jwt: token1 } = await login(request);
    const company = await createCompany(request, { plan, token: token1 });

    const service1 = await createService(request, { token: token1, category: category1, company: company });
    const service2 = await createService(request, { token: token1, category: category2, company: company });

    // user
    await createUser(request, { email: "someemail@email.com" });
    const { jwt: token2 } = await login(request, { email: "someemail@email.com" });

    await bookService(request, {
      company: company,
      service: service1,
      token: token2,
      time: "10:00",
      day: moment().format(format),
    });

    await bookService(request, {
      company: company,
      service: service2,
      token: token2,
      time: "10:00",
      day: moment().format(format),
    });

    const { status, body } = await request
      .get(`${baseUrl}?name=${name}`)
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(status).toBe(200);
    expect(body.length).toBe(2);
    expect(body[0].label).toBe(category1.name);
    expect(body[0].value).toBe(1);
    expect(body[1].label).toBe(category2.name);
    expect(body[1].value).toBe(1);

    done();
  });
});
