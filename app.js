const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base Error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API1
const convertCase = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
  };
};

const hasPriorityAndStatusProperty = (requestQuery) => {
  console.log(requestQuery);
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status == !undefined;
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  console.log(status);
  console.log(priority);
  let getToDoQuery = " ";
  let todoArray = " ";
  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      getToDoQuery = `
                SELECT * FROM todo
                WHERE status='${status}' AND priority='${priority}'
                AND todo LIKE '%${search_q}%';`;
      break;
    case hasPriorityProperty(request.query):
      getToDoQuery = `
                SELECT * FROM todo
                WHERE priority='${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getToDoQuery = `
                SELECT * FROM todo 
                WHERE status='${status}';`;
      break;
    default:
      getToDoQuery = `
                SELECT * FROM todo 
                WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  toDoArray = await db.all(getToDOQuery);
  console.log(toDoArray);
  response.send(toDoArray);
});
