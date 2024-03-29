import { Seeder } from "../../config/db.config";

const seedUsers = [
  {
    id: 1,
    email: "bryan.sanchez@usc.edu.ph",
    password: "$2b$10$URq.WnApWY.iNnZMQa4jcOlC/hjnZR4wv.1E1sN2wYI088XVnx.O2",
    student_id_number: "20101466",
    full_name: "Bryan Ignatius Sanchez",
    is_verified: true,
    verification_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJyeWFuLnNhbmNoZXpAdXNjLmVkdS5waCIsImlhdCI6MTY5ODc1NTI5MH0.IGwviF7-2Ap8cwcQRJLS13OlwC2XXezlnjYPhpYNiHk",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    email: "christian.dejesus@usc.edu.ph",
    password: "$2b$10$i3KaIbiHdt.6Ejv9kMJlh.oAS9gBnWXdQmmAZp7Z9JoKb8nNy76lG",
    student_id_number: "22101295",
    full_name: "Christian Antonio IV L. de Jesus",
    is_verified: true,
    verification_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNocmlzdGlhbi5kZWplc3VzQHVzYy5lZHUucGgiLCJpYXQiOjE2OTg3NTE4NzF9.5yuw4cQims03cac7L0lQlv4QGKnMgCcWJiHeImyXA6Q",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    email: "samuel.bonghanoy@usc.edu.ph",
    password: "$2b$10$f5MFKbiBoFzMk7fwbnN0AebCP9NaMXLQcMLU42HGiHX8FaKCeN9MS",
    student_id_number: "20103261",
    full_name: "Samuel Ethan Bonghanoy",
    is_verified: true,
    verification_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhbXVlbC5ib25naGFub3lAdXNjLmVkdS5waCIsImlhdCI6MTY5ODc1MTk0N30.qWtaVw165CUFFnjLt7Gy2xQavT5jl3bumcE1KvXMX4w",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    email: "fitzsixto.singh@usc.edu.ph",
    password: "$2b$10$eVR88f0BKGpyNLNXWY47deVuYRn5WSk7AwS.sk98wG8HQ8cOsO4jS",
    student_id_number: "20103994",
    full_name: "Fitzsixto Angelo Singh",
    is_verified: true,
    verification_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZpdHpzaXh0by5zaW5naEB1c2MuZWR1LnBoIiwiaWF0IjoxNjk4NzUxOTU3fQ.cyx-F0_5M73tTkFZ8EwGmWVAZ-Ih-Ip6i66qRkgd94w",
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("user", seedUsers);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("user", { id: seedUsers.map((u) => u.id) });
};
