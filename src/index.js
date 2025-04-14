import LocalStorageManager from "./modules/localStorage.js";
import ProjectManager from "./modules/projectManager.js";
import DOMController from "./modules/DOMController.js";
import Project from "./modules/project.js";
import TodoItem from "./modules/todoItem.js";
import getDayOfYear from "../node_modules/date-fns/getDayOfYear.js";
import "../src/styles.css";

const localStorage = new LocalStorageManager("todoAppData");
const today = getDayOfYear(new Date());

// Initialize the project manager with data from local storage
const stored = localStorage.load();

const storedProjects = localStorage.load();



// Rehydrate projects and their tasks
let projectManager = new ProjectManager(
  storedProjects
    ? storedProjects.map((project) => {
        const rehydratedProject = new Project(project.name, project.description);
        rehydratedProject.tasks = project.tasks.map(
          (task) =>
            new TodoItem(
              task.title,
              task.description,
              task.completed,
              task.dueDate,
              task.priority
            )
        );
        return rehydratedProject;
      })
    : []
);

let domController = new DOMController(projectManager);

console.log(projectManager.getProjects());
// Initialize the local storage manager

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
