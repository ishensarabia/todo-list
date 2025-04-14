import { de } from "date-fns/locale";

class DOMController {
  constructor(projectManager) {
    this.projectManager = projectManager;
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.bindAddProjectButton();
      this.bindAddTodoButton();
      this.renderProjects();
    });
  }

  bindAddProjectButton() {
    const addProjectButton = document.getElementById("add-project-btn");
    addProjectButton.addEventListener("click", () => {
      const projectName = prompt("Enter project name:");
      const projectDescription = prompt("Enter project description:");
      if (projectName) {
        this.projectManager.addProject(projectName, projectDescription);
        this.renderProjects();
      }
    });
  }

  bindAddTodoButton() {
    const addTodoButton = document.getElementById("add-todo-btn");
    if (addTodoButton) {
      addTodoButton.addEventListener("click", () => {
        const projectName = prompt("Enter project name for the todo:");
        const todoDescription = prompt("Enter todo description:");
        if (projectName) {
          this.projectManager.addTask(projectName, todoDescription);
          this.renderTodos(this.projectManager.currentProject.guid);
        }
      });
    }
  }

  renderProjects() {
    const projectList = document.getElementById("project-list");
    projectList.innerHTML = "";
    const projects = this.projectManager.getProjects();
    projects.forEach((project) => {
      const projectDiv = document.createElement("div");
      const button = document.createElement("button");
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.classList.add("delete-button");
      const h1 = document.createElement("h1");
      h1.classList.add("project-description");

      button.innerText = project.name;
      h1.textContent = project.description;

      projectList.appendChild(projectDiv);
      projectDiv.appendChild(button);
      projectDiv.appendChild(deleteButton);
      projectDiv.appendChild(h1);

      button.addEventListener("click", () => {
        if (this.activeProjectButton) {
          this.activeProjectButton.classList.remove("active");
        }
        this.activeProjectButton = button;
        this.projectManager.setCurrentProject(project);
        this.renderCurrentProject();
        button.classList.add("active");
      });

      deleteButton.addEventListener("click", () => {
        this.projectManager.removeProject(project.guid);
        this.renderProjects();
      });
    });
  }

  renderTodos(projectGuid) {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";
    const todos = this.projectManager.getTodosForProject(projectGuid);

    if (todos.length === 0) {
      const noTodosMessage = document.createElement("li");
      noTodosMessage.textContent = "No todos available for this project.";
      todoList.appendChild(noTodosMessage);
      return;
    }

    todos.forEach((todo) => {
      const todoItem = document.createElement("li");
      todoItem.classList.add("todo-item"); // Add a class for styling
      todoItem.textContent = `${todo.title}: ${todo.description}`;

      // Create Edit Button
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.classList.add("edit-button");

      editButton.addEventListener("click", () => {
        const newTitle = prompt("Edit todo title:", todo.title);
        const newDescription = prompt(
          "Edit todo description:",
          todo.description
        );
        if (newTitle && newDescription) {
          todo.title = newTitle;
          todo.description = newDescription;
          this.projectManager.updateTask(todo); // Add an updateTask method in ProjectManager
          this.renderTodos(this.projectManager.currentProject.guid);
        }
      });

      // Create Delete Button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete-button");

      deleteButton.addEventListener("click", () => {
        console.log("Deleting todo:", todo.title); // Debugging line
        this.projectManager.removeTask(todo.title);
        this.renderTodos(this.projectManager.currentProject.guid);
      });

      // Append buttons to the todo item
      todoItem.appendChild(editButton);
      todoItem.appendChild(deleteButton);
      todoList.appendChild(todoItem);
    });
  }

  renderCurrentProject() {
    const currentProjectlabel = document.getElementById("current-projcet");
    currentProjectlabel.textContent = `${this.projectManager.currentProject.name}`;
    this.renderTodos(this.projectManager.currentProject.guid);
  }
}

export default DOMController;
