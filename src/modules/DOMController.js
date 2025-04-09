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
      if (projectName) {
        this.projectManager.addProject(projectName);
        this.renderProjects();
      }
    });
  }

  bindAddTodoButton() {
    const addTodoButton = document.getElementById("add-todo-btn");
    if (addTodoButton) {
      addTodoButton.addEventListener("click", () => {
        const projectName = prompt("Enter project name for the todo:");
        const todoTitle = prompt("Enter todo title:");
        const todoDescription = prompt("Enter todo description:");
        if (projectName && todoTitle) {
          this.projectManager.addTodoToProject(projectName, {
            title: todoTitle,
            description: todoDescription,
          });
          this.renderTodos(projectName);
        }
      });
    }
  }

  renderProjects() {
    const projectList = document.getElementById("project-list");
    projectList.innerHTML = "";
    const projects = this.projectManager.getProjects();
    projects.forEach((project) => {
      const projectItem = document.createElement("li");
      projectItem.textContent = project.name;
      projectList.appendChild(projectItem);
    });
  }

  renderTodos(projectName) {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";
    const todos = this.projectManager.getTodosForProject(projectName);
    todos.forEach((todo) => {
      const todoItem = document.createElement("li");
      todoItem.textContent = `${todo.title}: ${todo.description}`;
      todoList.appendChild(todoItem);
    });
  }
}

export default DOMController;
