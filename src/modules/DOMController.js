import { getDayOfYear, format, parseISO, isValid } from "date-fns";

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
      this.showProjectForm({}, (newProject) => {
        this.projectManager.addProject(newProject.name, newProject.description);
        this.renderProjects();
        this.renderCurrentProject();
      });
    });
  }

  bindAddTodoButton() {
    const addTodoButton = document.getElementById("add-todo-btn");
    if (addTodoButton) {
      addTodoButton.addEventListener("click", () => {
        // Show the todo form for creating a new todo
        this.showTodoForm({}, (newTodo) => {
          // Add the new todo to the current project
          this.projectManager.addTask(
            newTodo.title,
            newTodo.description,
            newTodo.dueDate,
            newTodo.priority
          );
          // Re-render the todos for the current project
          this.renderTodos(this.projectManager.currentProject.guid);
        });
      });
    }
  }

  renderProjects() {
    const projectList = document.getElementById("project-list");
    projectList.innerHTML = "";
    const projects = this.projectManager.getProjects();
    projects.forEach((project) => {
      const projectDiv = document.createElement("div");
      const projectSpan = document.createElement("span");
      const deleteButton = document.createElement("button");
      const editButton = document.createElement("button");
      const overdueLabel = document.createElement("span");

      editButton.innerText = "✏️";
      editButton.title = "Edit Project";
      editButton.classList.add("edit-button");
      editButton.style.visibility = "hidden";
      deleteButton.innerText = "🗑️";
      deleteButton.title = "Delete Project";
      deleteButton.classList.add("delete-button");
      deleteButton.style.visibility = "hidden";

      projectSpan.innerText = project.name;
      projectSpan.classList.add("project-span");

      projectList.appendChild(projectDiv);
      projectDiv.appendChild(projectSpan);
      projectDiv.appendChild(editButton);
      projectDiv.appendChild(deleteButton);

      projectDiv.classList.add("project-item");


      // Check if the project is overdue
      if (this.projectManager.isProjectOverdue(project)) {
        // Get the number of overdue tasks
        const overdueTasks =
          this.projectManager.getNumberOfOverdueTasks(project);
        overdueLabel.textContent = `Overdue: ${overdueTasks} ${
          overdueTasks === 1 ? "task" : "tasks"
        }`;
        overdueLabel.classList.add("overdue-label");
        projectDiv.appendChild(overdueLabel);
      }

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

      projectDiv.addEventListener("click", () => {
        if (this.activeProject) {
          this.activeProject.classList.remove("active");
        }
        this.activeProject = projectDiv;
        this.projectManager.setCurrentProject(project);
        this.renderCurrentProject();
        projectDiv.classList.add("active");
        projectSpan.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });


      projectSpan.addEventListener("click", () => {
        if (this.activeProject) {
          this.activeProject.classList.remove("active");
        }
        this.activeProject = projectSpan;
        this.projectManager.setCurrentProject(project);
        this.renderCurrentProject();
        projectSpan.classList.add("active");
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
        this.showProjectForm(project, (updatedProject) => {
          this.projectManager.updateProject(
            project.guid,
            updatedProject.name,
            updatedProject.description
          );
          this.renderProjects();
          this.renderCurrentProject();
        });
      });
    });
  }

  renderTodos(projectGuid) {
    const todoList = document.getElementById("todo-list");
    // Clear the existing todo list
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

      // Create a div for the strike-through line
      const strikeThroughLine = document.createElement("div");
      strikeThroughLine.classList.add("strike-through-line");
      strikeThroughLine.style.visibility = todo.completed
        ? "visible"
        : "hidden";

        checkbox.addEventListener("change", () => {
          todo.completed = checkbox.checked;
          this.projectManager.updateTask(todo);
      
          // Toggle the visibility of the strike-through line
          strikeThroughLine.style.visibility = checkbox.checked ? "visible" : "hidden";
        });

      // Add due date with date-fns formatting
      const dueDate = document.createElement("span");
      if (todo.dueDate) {
        // Check if the due date is today or overdue
        const parsedDate = parseISO(todo.dueDate);
        const formattedDate = format(parseISO(todo.dueDate), "MMMM do, yyyy");
        const dayOfYear = getDayOfYear(parsedDate);
        console.log(dayOfYear, getDayOfYear(new Date()));
        const isToday = dayOfYear === getDayOfYear(new Date());
        const isOverdue = this.projectManager.isTaskOverdue(todo);
        const overdueDays = Math.floor(
          (new Date() - new Date(todo.dueDate)) / (1000 * 60 * 60 * 24)
        );
        if (isToday) {
          dueDate.textContent = "📅 Today";
        } else if (isOverdue) {
          dueDate.textContent = `📅 ${formattedDate} (${
            overdueDays === 1 ? "Overdue" : `${overdueDays} days overdue`
          })`;
          dueDate.classList.add("overdue-label");
        } else {
          dueDate.textContent = `📅 ${formattedDate}`;
        }
      } else {
        dueDate.textContent = "";
      }
      dueDate.classList.add("todo-due-date");

      // Add priority
      const priority = document.createElement("span");
      priority.textContent = `Priority: ${todo.priority || "None"}`;
      priority.classList.add("todo-priority");

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
          this.renderProjects();
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
          this.renderProjects();
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
      todoItem.appendChild(dueDate);
      todoItem.appendChild(priority);
      todoItem.appendChild(editButton);
      todoItem.appendChild(deleteButton);
      todoItem.appendChild(strikeThroughLine);
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
            Title
            <input type="text" name="title" value="${
              todo.title || ""
            }" required />
        </label>
        <label>
            Description
            <textarea name="description">${todo.description || ""}</textarea>
        </label>
        <label>
            Due Date
            <input type="date" name="dueDate" value="${todo.dueDate || ""}" />
        </label>
        <label>
            Priority
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
      const dueDate = formData.get("dueDate");

      // Validate the due date
      if (dueDate && !isValid(new Date(dueDate))) {
        alert("Invalid due date. Please enter a valid date.");
        return;
      }

      const updatedTodo = {
        title: formData.get("title"),
        description: formData.get("description"),
        dueDate: dueDate || null,
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

  showProjectForm(project = {}, onSubmit) {
    const formContainer = document.createElement("div");
    formContainer.classList.add("project-form-container");

    const form = document.createElement("form");
    form.classList.add("project-form");

    form.innerHTML = `
        <label>
            Project Name
            <input type="text" name="name" value="${
              project.name || ""
            }" required />
        </label>
        <label>
            Description
            <textarea name="description">${project.description || ""}</textarea>
        </label>
        <button type="submit">Save</button>
        <button type="button" class="cancel-button">Cancel</button>
    `;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      const updatedProject = {
        name: formData.get("name"),
        description: formData.get("description"),
      };
      onSubmit(updatedProject);
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
