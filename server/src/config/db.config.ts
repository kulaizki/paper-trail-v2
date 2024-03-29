import { Sequelize } from "sequelize-typescript";
import env from "./env.config";
import { Umzug, SequelizeStorage } from "umzug";

const sequelize = new Sequelize(env.DATABASE, env.USER, env.PASSWORD, {
  host: env.DB_HOST,
  dialect: "mysql",
  logging: console.log
});

export const migrator = new Umzug({
  migrations: {
    glob: ["../db/migrations/*.ts", { cwd: __dirname }]
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
    modelName: "migrator_meta"
  }),
  logger: console
});

export type Migration = typeof migrator._types.migration;

export const seeder = new Umzug({
  migrations: {
    glob: ["../db/seeders/*.ts", { cwd: __dirname }]
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
    modelName: "seeder_meta"
  }),
  logger: console
});

export type Seeder = typeof seeder._types.migration;

export default sequelize;
