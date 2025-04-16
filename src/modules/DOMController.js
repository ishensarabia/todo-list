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
      const editButton = document.createElement("button");
      editButton.innerText = "✏️";
      editButton.title = "Edit Project";
      editButton.classList.add("edit-button");
      editButton.style.visibility = "hidden";
      deleteButton.innerText = "🗑️";
      deleteButton.title = "Delete Project";
      deleteButton.classList.add("delete-button");
      deleteButton.style.visibility = "hidden";
      // const h1 = document.createElement("h1");
      // h1.classList.add("project-description");

      button.innerText = project.name;
      // h1.textContent = project.description;

      projectList.appendChild(projectDiv);
      projectDiv.appendChild(button);
      projectDiv.appendChild(editButton);
      projectDiv.appendChild(deleteButton);
      // projectDiv.appendChild(h1);

      projectDiv.classList.add("project-item");
      projectDiv.addEventListener("mouseover", () => {
        deleteButton.style.visibility = "visible";
        editButton.style.visibility = "visible";
      });
      projectDiv.addEventListener("mouseout", () => {
        deleteButton.style.visibility = "hidden";
        editButton.style.visibility = "hidden";
      });

      projectDiv.addEventListener("focusin", () => {
        deleteButton.style.visibility = "visible";
        editButton.style.visibility = "visible";
      });

      projectDiv.addEventListener("focusout", () => {
        deleteButton.style.visibility = "hidden";
        editButton.style.visibility = "hidden";
      });

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
        if (this.projectManager.currentProject.guid === project.guid) {
          this.projectManager.setCurrentProject();
        }
        this.projectManager.removeProject(project.guid);
        this.renderProjects();
        this.renderCurrentProject();
      });

      editButton.addEventListener("click", () => {
        const newName = prompt("Enter new project name:", project.name);
        const newDescription = prompt(
          "Enter new project description:",
          project.description
        );
        if (newName && newDescription) {
          this.projectManager.updateProject(
            project.guid,
            newName,
            newDescription
          );
          this.renderProjects();
          this.renderCurrentProject();
        }
      });
    });
  }

  renderTodos(projectGuid) {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";
    const todos =
      this.projectManager.getTodosForProject(projectGuid) ||
      this.projectManager.getCurrentProject().tasks;

    if (todos.length === 0) {
      const noTodosMessage = document.createElement("li");
      noTodosMessage.textContent = "No todos available for this project.";
      noTodosMessage.classList.add("no-todos-message");
      todoList.appendChild(noTodosMessage);
      return;
    }

    todos.forEach((todo) => {
      const todoItem = document.createElement("li");
      todoItem.classList.add("todo-item");

      // Create a checkbox for completion
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.classList.add("todo-checkbox");

      checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;
        this.projectManager.updateTask(todo);
      });

      // Create a span for the todo title
      const todoText = document.createElement("span");
      todoText.textContent = `${todo.title}`;
      if (todo.completed) {
        todoText.style.textDecoration = "line-through";
      }

      checkbox.addEventListener("change", () => {
        todoText.style.textDecoration = checkbox.checked
          ? "line-through"
          : "none";
      });

      // Create Edit Button
      const editButton = document.createElement("button");
      editButton.innerHTML = "✏️";
      editButton.title = "Edit Todo";
      editButton.classList.add("icon-button", "edit-button");

      editButton.addEventListener("click", () => {
        this.showTodoForm(todo, (updatedTodo) => {
          Object.assign(todo, updatedTodo);
          this.projectManager.updateTask(todo);
          this.renderTodos(this.projectManager.currentProject.guid);
        });
      });

      // Add pointer cursor to todoText
      todoText.style.cursor = "pointer";

      // Add event listener to show the todo form only when clicking on the text
      todoText.addEventListener("click", () => {
        this.showTodoForm(todo, (updatedTodo) => {
          Object.assign(todo, updatedTodo);
          this.projectManager.updateTask(todo);
          this.renderTodos(this.projectManager.currentProject.guid);
        });
      });

      // Create Delete Button
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = "🗑️";
      deleteButton.title = "Delete Todo";
      deleteButton.classList.add("icon-button", "delete-button");

      deleteButton.addEventListener("click", () => {
        this.projectManager.removeTask(todo.title);
        this.renderTodos(this.projectManager.currentProject.guid);
      });

      // Append elements to the todo item
      todoItem.appendChild(checkbox);
      todoItem.appendChild(todoText);
      todoItem.appendChild(editButton);
      todoItem.appendChild(deleteButton);
      todoList.appendChild(todoItem);
    });
  }

  showTodoForm(todo = {}, onSubmit) {
    const formContainer = document.createElement("div");
    formContainer.classList.add("todo-form-container");

    const form = document.createElement("form");
    form.classList.add("todo-form");

    form.innerHTML = `
        <label>
            Title:
            <input type="text" name="title" value="${
              todo.title || ""
            }" required />
        </label>
        <label>
            Description:
            <textarea name="description">${todo.description || ""}</textarea>
        </label>
        <label>
            Due Date:
            <input type="date" name="dueDate" value="${todo.dueDate || ""}" />
        </label>
        <label>
            Priority:
            <select name="priority">
                <option value="low" ${
                  todo.priority === "low" ? "selected" : ""
                }>Low</option>
                <option value="medium" ${
                  todo.priority === "medium" ? "selected" : ""
                }>Medium</option>
                <option value="high" ${
                  todo.priority === "high" ? "selected" : ""
                }>High</option>
            </select>
        </label>
        <button type="submit">Save</button>
        <button type="button" class="cancel-button">Cancel</button>
    `;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const updatedTodo = {
        title: formData.get("title"),
        description: formData.get("description"),
        dueDate: formData.get("dueDate"),
        priority: formData.get("priority"),
      };
      onSubmit(updatedTodo);
      document.body.removeChild(formContainer);
    });

    form.querySelector(".cancel-button").addEventListener("click", () => {
      document.body.removeChild(formContainer);
    });

    formContainer.appendChild(form);
    document.body.appendChild(formContainer);
  }

  renderCurrentProject() {
    const currentProjectlabel = document.getElementById("current-project");
    if (this.projectManager.currentProject) {
      currentProjectlabel.textContent = `${this.projectManager.currentProject.name}`;
      currentProjectlabel.style.visibility = "visible";
      this.renderTodos(this.projectManager.currentProject.guid);
    } else {
      currentProjectlabel.textContent = "";
      currentProjectlabel.style.visibility = "hidden";
    }
  }
}

export default DOMController;
