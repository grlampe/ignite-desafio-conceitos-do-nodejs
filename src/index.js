const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * MODEL
 * id: uuidv4
 * name: string 
 * username: string
 * todos: []
 */

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers; 

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.users = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { users } = request;

  return response.json(users.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { users } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  users.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { users } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = users.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "To Do not found!" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { users } = request;
  const { id } = request.params;

  const todo = users.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "To Do not found!" });
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { users } = request;
  const { id } = request.params;

  const todo = users.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "To Do not found!" });
  }

  users.todos.splice(users.todos.indexOf(todo), 1);

  return response.status(204).json(users.todos);
});

module.exports = app;