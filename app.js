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
  //console.log(requestQuery);
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatusProperty = (requestQuery) => {
  //console.log(requestQuery);
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  //console.log(status);
  //console.log(priority);
  let getToDoQuery = " ";
  let todoArray = " ";
  console.log(hasStatusProperty(request.query));
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
      console.log(hasStatusProperty(request.query));
      getToDoQuery = `
                SELECT * FROM todo 
                WHERE status='${status}';`;
      //console.log(getToDoQuery);
      break;
    default:
      console.log("default");
      getToDoQuery = `
                SELECT * FROM todo 
                WHERE todo LIKE '%${search_q}%';`;
      console.log(getToDoQuery);
      break;
  }
  toDoArray = await db.all(getToDoQuery);
  console.log(toDoArray);
  response.send(toDoArray);
});

//API2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const gettoDOById = `
        SELECT * FROM todo
        WHERE id=${todoId};`;
  const todo = await db.get(gettoDOById);
  response.send(todo);
});

//API3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addToDoQuery = `
        INSERT INTO todo
        (id,todo,priority,status)
        VALUES 
        (${id},'${todo}','${priority}','${status}');`;
  await db.run(addToDoQuery);
  response.send("Todo Successfully Added");
});

//API4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updatedColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;
    default:
      console.log("No Field updated");
      break;
  }
  const todoDetailtobeUpdatedQuery = `
    SELECT * FROM todo
    WHERE id=${todoId};`;
  const todoDetail = await db.get(todoDetailtobeUpdatedQuery);
  console.log(todoDetail);
  const {
    id = todoDetail.id,
    todo = todoDetail.todo,
    priority = todoDetail.priority,
    status = todoDetail.status,
  } = requestBody;
  const updateDetailsQuery = `
        UPDATE todo
        SET todo='${todo}',
            priority='${priority}',
            status='${status}';`;
  await db.run(updateDetailsQuery);
  response.send(`${updatedColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteToDoQuery = `
        DELETE FROM todo
        WHERE id=${todoId};`;
  await db.run(deleteToDoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
