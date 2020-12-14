const supertest = require("supertest");

const app = require("../app");
const request = supertest(app);

const { clearDatabase, createDefaultCategories, createDefaultPlans, createUser, login } = require("./helpers");

describe.only("Users test", () => {
  const baseUrl = "/users";

  beforeEach(async () => {
    await clearDatabase();
    await createDefaultCategories();
    await createDefaultPlans();
  });

  it("should create a new user using email and password", async (done) => {
    const { body } = await request.post("/users/signup").send({
      firstName: "Lucas",
      lastName: "Ferreira",
      email: "lucasmarchel13@gmail.com",
      password: "123456",
    });

    expect(body).toBeDefined();
    expect(body.id).toBeDefined();

    done();
  });

  it("should create a new user googleId", async (done) => {
    const { body } = await request.post("/users/signup").send({
      firstName: "Lucas",
      lastName: "Ferreira",
      email: "lucasmarchel13@gmail.com",
      googleId: "1a1sd981as98d1as9d1a9sd",
    });

    expect(body).toBeDefined();
    expect(body.id).toBeDefined();

    done();
  });

  it("should login using email and password", async (done) => {
    await request.post("/users/signup").send({
      firstName: "Lucas",
      lastName: "Ferreira",
      email: "lucasmarchel13@gmail.com",
      password: "123456",
    });

    const { body } = await request
      .post("/users/signin")
      .send({ email: "lucasmarchel13@gmail.com", password: "123456" });

    expect(body).toBeDefined();
    expect(body.jwt).toBeDefined();
    expect(body.firstName).toBe("Lucas");
    expect(body.lastName).toBe("Ferreira");

    done();
  });

  it("should login using googleId", async (done) => {
    await request.post("/users/signup").send({
      firstName: "Lucas",
      lastName: "Ferreira",
      email: "lucasmarchel13@gmail.com",
      googleId: "1a1sd981as98d1as9d1a9sd",
    });

    const { body } = await request.post("/users/signin").send({ googleId: "1a1sd981as98d1as9d1a9sd" });

    expect(body).toBeDefined();
    expect(body.jwt).toBeDefined();
    expect(body.firstName).toBe("Lucas");
    expect(body.lastName).toBe("Ferreira");

    done();
  });

  it("should update user", async (done) => {
    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const payload = {
      firstName: "newname",
      lastName: "newname",
      email: "newemail@gmail.com",
      password: "987654",
    };

    const { body } = await request.patch(baseUrl).set("Authorization", `Bearer ${token}`).send(payload);

    expect(body.id).toBe(userId);
    expect(body.firstName).toBe("newname");
    expect(body.lastName).toBe("newname");
    expect(body.email).toBe("newemail@gmail.com");

    done();
  });

  it("get current user", async (done) => {
    const userId = await createUser(request);
    const { jwt: token } = await login(request);

    const { body } = await request.get(`${baseUrl}/me`).set("Authorization", `Bearer ${token}`).send({});

    expect(body.id).toBe(userId);
    expect(body.firstName).toBe("Lucas");
    expect(body.lastName).toBe("Ferreira");
    expect(body.email).toBe("lucasmarchel13@gmail.com");

    done();
  });
});
