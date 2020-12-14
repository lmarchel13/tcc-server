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

describe.only("Conversation test", () => {
  const baseUrl = "/conversations";

  beforeEach(async () => {
    await clearDatabase();
    await createDefaultCategories();
    await createDefaultPlans();
  });

  it("should create a new conversation", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const company = await createCompany(request, { plan, token });

    const service = await createService(request, { token, category, company });

    const payload = {
      serviceId: service.id,
      companyId: company.id,
    };

    const { status, body } = await request.post(baseUrl).set("Authorization", `Bearer ${token}`).send(payload);

    expect(status).toBe(201);
    expect(body).toBeDefined();
    expect(body.id).toBeDefined();
    expect(body.service.id).toBe(service.id);
    expect(body.company.id).toBe(company.id);
    expect(body.user.id).toBe(userId);

    done();
  });

  it("should get a new conversation if already exist", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const company = await createCompany(request, { plan, token });

    const service = await createService(request, { token, category, company });

    const payload = {
      serviceId: service.id,
      companyId: company.id,
    };

    const response = await request.post(baseUrl).set("Authorization", `Bearer ${token}`).send(payload);
    expect(response.status).toBe(201);

    const { status, body } = await request.post(baseUrl).set("Authorization", `Bearer ${token}`).send(payload);

    expect(status).toBe(200);
    expect(body).toBeDefined();
    expect(body.id).toBeDefined();
    expect(body.service.id).toBe(service.id);
    expect(body.company.id).toBe(company.id);
    expect(body.user.id).toBe(userId);

    done();
  });

  it("should load a conversation", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const company = await createCompany(request, { plan, token });

    const service = await createService(request, { token, category, company });

    const payload = {
      serviceId: service.id,
      companyId: company.id,
    };

    const response = await request.post(baseUrl).set("Authorization", `Bearer ${token}`).send(payload);
    expect(response.status).toBe(201);

    const { status, body } = await request
      .get(`${baseUrl}?serviceId=${service.id}&companyId=${company.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(status).toBe(200);
    expect(body).toBeDefined();
    expect(body.id).toBeDefined();
    expect(body.service.id).toBe(service.id);
    expect(body.company.id).toBe(company.id);
    expect(body.user.id).toBe(userId);

    done();
  });

  it("should add a message to conversation as a USER", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const company = await createCompany(request, { plan, token });

    const service = await createService(request, { token, category, company });

    const payload = {
      serviceId: service.id,
      companyId: company.id,
    };

    const {
      status,
      body: { id: conversationId },
    } = await request.post(baseUrl).set("Authorization", `Bearer ${token}`).send(payload);
    expect(status).toBe(201);

    const response = await request
      .post(`${baseUrl}/${conversationId}/messages`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "some message",
        sender: "USER",
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.conversation.id).toBe(conversationId);
    expect(response.body.user.id).toBe(userId);
    expect(response.body.sender).toBe("USER");

    done();
  });

  it("should add a message to conversation as a COMPANY", async (done) => {
    const { body: plans } = await request.get("/plans");
    const plan = plans[0];

    const { body: categories } = await request.get("/categories");
    const category = categories[0];

    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const company = await createCompany(request, { plan, token });

    const service = await createService(request, { token, category, company });

    const payload = {
      serviceId: service.id,
      companyId: company.id,
    };

    const {
      status,
      body: { id: conversationId },
    } = await request.post(baseUrl).set("Authorization", `Bearer ${token}`).send(payload);
    expect(status).toBe(201);

    const response = await request
      .post(`${baseUrl}/${conversationId}/messages`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "some message",
        sender: "COMPANY",
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.conversation.id).toBe(conversationId);
    expect(response.body.user.id).toBe(userId);
    expect(response.body.sender).toBe("COMPANY");

    done();
  });
});
