import express, { Router } from "express";

const route = Router();

const users = {};

route.get("/user-data/:id", (req, res) => {
  const { id } = req.params;
  if (users[id]) {
    res.send(users[id]);
  } else {
    res.status(404).send("User not found");
  }
});

route.post("/user/:id", (req, res) => {
  users[req.params.id] = { name: req.params.id };
  res.send(200);
});

const app = express();

app.use("/api", route);

export default app;
