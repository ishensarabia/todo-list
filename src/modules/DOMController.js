import { getDayOfYear, format, parseISO, isValid } from "date-fns";

class DOMController {
  constructor(projectManager) {
    this.projectManager = projectManager;
    this.activeProject = null;
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
      });
    });
  }

  bindAddTodoButton() {
    const addTodoButton = document.getElementById("add-todo-btn");
    if (addTodoButton) {
      addTodoButton.addEventListener("click", () => {
        this.showTodoForm({}, (newTodo) => {
          this.projectManager.addTask(
            newTodo.title,
            newTodo.description,
            newTodo.dueDate,
            newTodo.priority
          );
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
      const projectDiv = this.createProjectElement(project);
      projectList.appendChild(projectDiv);
    });
  }

  createProjectElement(project) {
    const projectDiv = document.createElement("div");
    projectDiv.classList.add("project-item");

    const projectSpan = document.createElement("span");
    projectSpan.textContent = project.name;
    projectSpan.classList.add("project-span");

    const editButton = this.createButton(
      "✏️",
      "Edit Project",
      "edit-button",
      () => {
        this.showProjectForm(project, (updatedProject) => {
          this.projectManager.updateProject(
            project.guid,
            updatedProject.name,
            updatedProject.description
          );
          this.renderProjects();
          this.renderCurrentProject();
        });
      }
    );

    const deleteButton = this.createButton(
      "🗑️",
      "Delete Project",
      "delete-button",
      () => {
        this.handleProjectDeletion(project);
      }
    );

    const overdueLabel = this.createOverdueLabel(project);

    projectDiv.appendChild(projectSpan);
    projectDiv.appendChild(editButton);
    projectDiv.appendChild(deleteButton);
    if (overdueLabel) projectDiv.appendChild(overdueLabel);

    projectDiv.addEventListener("click", () => {
      this.setActiveProject(project, projectDiv);
    });

    return projectDiv;
  }

  createButton(text, title, className, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.title = title;
    button.classList.add("icon-button", className);
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent triggering parent click events
      onClick();
    });
    return button;
  }

  createOverdueLabel(project) {
    if (this.projectManager.isProjectOverdue(project)) {
      const overdueTasks = this.projectManager.getNumberOfOverdueTasks(project);
      const overdueLabel = document.createElement("span");
      overdueLabel.textContent = `Overdue: ${overdueTasks} ${
        overdueTasks === 1 ? "task" : "tasks"
      }`;
      overdueLabel.classList.add("overdue-label");
      return overdueLabel;
    }
    return null;
  }

  setActiveProject(project, projectDiv) {
    if (this.activeProject) {
      this.activeProject.classList.remove("active");
    }
    this.activeProject = projectDiv;
    this.projectManager.setCurrentProject(project);
    this.renderCurrentProject();
    projectDiv.classList.add("active");
  }

  handleProjectDeletion(project) {
    if (this.projectManager.currentProject.guid === project.guid) {
      this.projectManager.setCurrentProject(null); // Clear the current project
      this.clearTodos();
      document.getElementById("add-todo-container").style.visibility = "hidden";
    }
    this.projectManager.removeProject(project.guid);
    this.renderProjects();
    this.renderCurrentProject();
  }

  renderTodos(projectGuid) {
    const todoList = document.getElementById("todo-list");
    this.clearTodos();

    const todos =
      this.projectManager.getTodosForProject(projectGuid) ||
      this.projectManager.getCurrentProject().tasks;

    if (todos.length === 0) {
      this.displayNoTodosMessage(todoList);
      return;
    }

    todos.forEach((todo) => {
      const todoItem = this.createTodoElement(todo);
      todoList.appendChild(todoItem);
    });
  }

  createTodoElement(todo) {
    const todoItem = document.createElement("li");
    todoItem.classList.add("todo-item");

    const checkbox = this.createCheckbox(todo);
    const todoText = this.createTodoText(todo);
    const dueDate = this.createDueDate(todo);
    const priority = this.createPriority(todo);
    // Create a div for the strike-through line
    const strikeThroughLine = document.createElement("div");
    strikeThroughLine.classList.add("strike-through-line");
    strikeThroughLine.style.visibility = todo.isCompleted
      ? "visible"
      : "hidden";

    // Add event listener to open task preview
    todoText.addEventListener("click", () => {
      this.showTaskPreview(todo, (updatedTodo) => {
        this.projectManager.updateTask(updatedTodo);
        this.renderTodos(this.projectManager.currentProject.guid);
      });
    });

    const editButton = this.createButton(
      "✏️",
      "Edit Task",
      "edit-button",
      () => {
        this.showTodoForm(todo, (updatedTodo) => {
          Object.assign(todo, updatedTodo);
          this.projectManager.updateTask(todo);
          this.renderTodos(this.projectManager.currentProject.guid);
        });
      }
    );
    const deleteButton = this.createButton(
      "🗑️",
      "Delete Task",
      "delete-button",
      () => {
        this.projectManager.removeTask(todo.title);
        this.renderTodos(this.projectManager.currentProject.guid);
      }
    );

    todoItem.appendChild(checkbox);
    todoItem.appendChild(todoText);
    todoItem.appendChild(dueDate);
    todoItem.appendChild(priority);
    todoItem.appendChild(editButton);
    todoItem.appendChild(deleteButton);
    todoItem.appendChild(strikeThroughLine);

    return todoItem;
  }

  createCheckbox(todo) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.isCompleted;
    checkbox.classList.add("todo-checkbox");

    checkbox.addEventListener("change", () => {
      todo.isCompleted = checkbox.checked;
      this.projectManager.updateTask(todo);
      // Update the strike-through line visibility
      const strikeThroughLine = checkbox.parentElement.querySelector(
        ".strike-through-line"
      );
      strikeThroughLine.style.visibility = todo.isCompleted
        ? "visible"
        : "hidden";
    });

    return checkbox;
  }

  createTodoText(todo) {
    const todoText = document.createElement("span");
    todoText.textContent = todo.title;
    todoText.style.cursor = "pointer";
    if (todo.completed) {
      todoText.style.textDecoration = "line-through";
    }
    return todoText;
  }

  createDueDate(todo) {
    const dueDate = document.createElement("span");
    if (todo.dueDate) {
      const parsedDate = parseISO(todo.dueDate);
      const formattedDate = format(parsedDate, "MMMM do, yyyy");
      const isOverdue = this.projectManager.isTaskOverdue(todo);
      const isToday = getDayOfYear(parsedDate) == getDayOfYear(new Date());
      const overdueDays = Math.floor(
        (new Date() - new Date(todo.dueDate)) / (1000 * 60 * 60 * 24)
      );

      if (isOverdue) {
        dueDate.textContent = `📅 ${formattedDate} (${overdueDays} days overdue)`;
        dueDate.classList.add("overdue-label");
      } else if (isToday) {
        dueDate.textContent = `📅 ${formattedDate} (Due today)`;
      } else {
        dueDate.textContent = `📅 ${formattedDate}`;
      }
    }
    dueDate.classList.add("todo-due-date");
    return dueDate;
  }

  createPriority(todo) {
    const priority = document.createElement("span");
    priority.textContent = `Priority: ${todo.priority || "None"}`;
    priority.classList.add("todo-priority");
    return priority;
  }

  displayNoTodosMessage(todoList) {
    const noTodosMessage = document.createElement("li");
    noTodosMessage.textContent = "No tasks available for this project.";
    noTodosMessage.classList.add("no-todos-message");
    todoList.appendChild(noTodosMessage);
  }

  renderCurrentProject() {
    const currentProjectLabel = document.getElementById("current-project");
    if (this.projectManager.currentProject) {
      currentProjectLabel.textContent = this.projectManager.currentProject.name;
      currentProjectLabel.style.visibility = "visible";
      document.getElementById("add-todo-container").style.visibility = "visible";

      this.renderTodos(this.projectManager.currentProject.guid);
    } else {
      currentProjectLabel.textContent = "";
      currentProjectLabel.style.visibility = "hidden";
    }
  }

  clearTodos() {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";
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
      const updatedTodo = {
        title: formData.get("title"),
        description: formData.get("description"),
        dueDate: formData.get("dueDate") || null,
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

  showTaskPreview(todo, onUpdate) {
    const previewContainer = document.createElement("div");
    previewContainer.classList.add("task-preview-container");

    const previewContent = document.createElement("div");
    previewContent.classList.add("task-preview-content");

    // Task Title
    const taskTitle = document.createElement("h2");
    taskTitle.textContent = todo.title;

    // Task Description
    const taskDescription = document.createElement("p");
    taskDescription.textContent =
      todo.description || "No description provided.";

    // Task Due Date
    const taskDueDate = document.createElement("p");
    taskDueDate.textContent = `Due Date: ${todo.dueDate || "No due date"}`;

    // Task Priority
    const taskPriority = document.createElement("p");
    taskPriority.textContent = `Priority: ${todo.priority || "None"}`;

    // Edit Button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit Task";
    editButton.addEventListener("click", () => {
      this.showTodoForm(todo, (updatedTodo) => {
        Object.assign(todo, updatedTodo);
        onUpdate(todo);
        document.body.removeChild(previewContainer);
      });
    });

    // Close Button
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.classList.add("cancel-button");
    closeButton.addEventListener("click", () => {
      document.body.removeChild(previewContainer);
    });

    // Append Elements
    previewContent.appendChild(taskTitle);
    previewContent.appendChild(taskDescription);
    previewContent.appendChild(taskDueDate);
    previewContent.appendChild(taskPriority);
    previewContent.appendChild(editButton);
    previewContent.appendChild(closeButton);
    previewContainer.appendChild(previewContent);
    document.body.appendChild(previewContainer);
  }
}

export default DOMController;
