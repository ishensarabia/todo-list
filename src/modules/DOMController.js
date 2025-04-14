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
          this.projectManager.addToDo(projectName, todoDescription);
          this.renderTodos(
            this.projectManager.currentProject.guid
          );
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
      console.log(todo);
      const todoItem = document.createElement("li");
      todoItem.textContent = `${todo.title}: ${todo.description}`;
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
