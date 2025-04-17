import LocalStorageManager from "./modules/localStorage.js";
import ProjectManager from "./modules/projectManager.js";
import DOMController from "./modules/DOMController.js";
import Project from "./modules/project.js";
import TodoItem from "./modules/todoItem.js";
import "../src/styles.css";

const localStorage = new LocalStorageManager("todoAppData");

// Initialize the project manager with data from local storage
const stored = localStorage.load();

const storedProjects = localStorage.load();

// Rehydrate projects and their tasks
const projectManager = new ProjectManager();

if (storedProjects) {
  projectManager.rehydrateProjects(storedProjects);
}

const domController = new DOMController(projectManager);

if (projectManager.getProjects().length !== 0) {
  // Set the current project to the first one in the list
  const firstProject = projectManager.getProjects()[0];
  projectManager.setCurrentProject(firstProject);
  domController.setActiveProject(firstProject);
  domController.setAddTodoContainerVisibility(true);
}



// Initialize the local storage manager

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
