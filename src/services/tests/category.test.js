const { find, createCategory, getById } = require("../category");

const { Category } = require("../../models");

describe("Category service", () => {
  describe("test find", () => {
    it("should return an array of categories", async () => {
      Category.find = jest.fn(() => {
        return {
          limit: jest.fn(() => {
            return {
              skip: jest.fn(() => [
                { id: 1, name: "categoria 1" },
                { id: 2, name: "categoria 2" },
              ]),
            };
          }),
        };
      });

      const data = await find();

      expect(data.length).toBe(2);
    });
  });

  describe("test createCategory", () => {
    it("should create a new category", async () => {
      const name = "some category";
      Category.save = jest.fn().mockResolvedValue({});

      const data = await createCategory({ name });

      console.log("data", data);
      expect(Category.save).toHaveBeenCalledWith({ name });
    });
  });
});
