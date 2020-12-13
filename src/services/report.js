const { last } = require("lodash");
const moment = require("moment");
const { Transaction } = require("../models");
const {
  errors: { BadRequestError },
} = require("../utils");

const REPORTS = {
  LAST_YEAR: "LAST_YEAR",
  LAST_6M: "LAST_6M",
  PER_COMPANY: "PER_COMPANY",
  PER_CATEGORY: "PER_CATEGORY",
};

const MONTHS = {
  1: "Jan",
  2: "Fev",
  3: "Mar",
  4: "Abr",
  5: "Mai",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Set",
  10: "Out",
  11: "Nov",
  12: "Dez",
};

const MONTHS_VALUE = {
  Jan: 1,
  Fev: 2,
  Mar: 3,
  Abr: 4,
  Mai: 5,
  Jun: 6,
  Jul: 7,
  Ago: 8,
  Set: 9,
  Out: 10,
  Nov: 11,
  Dez: 12,
};

const getReport = async ({ name, userId, companies }) => {
  const reportsObject = {};

  switch (name) {
    case REPORTS.LAST_YEAR:
      const lastYear = await Transaction.find({
        seller: { _id: companies.map((c) => c.id) },
        createdAt: { $gte: moment().subtract(1, "years").format() },
      });

      lastYear.forEach((t) => {
        const month = MONTHS[+t.day.split("/")[1]];
        const year = t.day.split("/")[2].slice(2);
        const key = `${month}/${year}`;
        reportsObject[key] = reportsObject[key] ? reportsObject[key] + 1 : 1;
      });

      return Object.keys(reportsObject)
        .map((key) => {
          return { label: key, value: reportsObject[key] };
        })
        .sort((a, b) => {
          const [aMonth, aYear] = a.label.split("/");
          const [bMonth, bYear] = b.label.split("/");

          if (aYear > bYear) return 1;
          if (aYear < bYear) return -1;
          if (MONTHS_VALUE[aMonth] > MONTHS_VALUE[bMonth]) return 1;
          if (MONTHS_VALUE[aMonth] < MONTHS_VALUE[bMonth]) return -1;

          return 0;
        });

    case REPORTS.LAST_6M:
      const lastSixMonths = await Transaction.find({
        seller: { _id: companies.map((c) => c.id) },
        createdAt: { $gte: moment().subtract(6, "months").format() },
      });

      lastSixMonths.forEach((t) => {
        const month = MONTHS[+t.day.split("/")[1]];
        const year = t.day.split("/")[2].slice(2);
        const key = `${month}/${year}`;
        reportsObject[key] = reportsObject[key] ? reportsObject[key] + 1 : 1;
      });

      return Object.keys(reportsObject)
        .map((month) => {
          return { label: month, value: reportsObject[month] };
        })
        .sort((a, b) => {
          const [aMonth, aYear] = a.label.split("/");
          const [bMonth, bYear] = b.label.split("/");

          if (aYear > bYear) return 1;
          if (aYear < bYear) return -1;
          if (MONTHS_VALUE[aMonth] > MONTHS_VALUE[bMonth]) return 1;
          if (MONTHS_VALUE[aMonth] < MONTHS_VALUE[bMonth]) return -1;

          return 0;
        });
    case REPORTS.PER_COMPANY:
      const reportsPerCompany = await Transaction.find({
        seller: { _id: companies.map((c) => c.id) },
      }).populate("seller");

      reportsPerCompany.forEach((t) => {
        const {
          seller: { name },
        } = t;
        reportsObject[name] = reportsObject[name] ? reportsObject[name] + 1 : 1;
      });

      return Object.keys(reportsObject).map((key) => {
        return { label: key, value: reportsObject[key] };
      });

    case REPORTS.PER_CATEGORY:
      const reportsPerCategory = await Transaction.find({
        seller: { _id: companies.map((c) => c.id) },
      }).populate("service", "name", null, { populate: { path: "category" } });

      console.log("reportsPerCategory", reportsPerCategory);

      reportsPerCategory.forEach((t) => {
        const {
          service: {
            category: { name },
          },
        } = t;
        reportsObject[name] = reportsObject[name] ? reportsObject[name] + 1 : 1;
      });

      return Object.keys(reportsObject).map((key) => {
        return { label: key, value: reportsObject[key] };
      });

    default:
      throw new BadRequestError("Tipo de relatório não existe");
  }
};

module.exports = {
  getReport,
};
