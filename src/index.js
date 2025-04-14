import LocalStorageManager from "./modules/localStorage.js";
import ProjectManager from "./modules/projectManager.js";
import DOMController from "./modules/DOMController.js";
import ToDoItem from "../src/modules/todoItem.js";
import getDayOfYear from "../node_modules/date-fns/getDayOfYear.js";
import "../src/styles.css";

const localStorage = new LocalStorageManager("todoAppData");
const today = getDayOfYear(new Date());

let projectManager = new ProjectManager();

// Initialize the project manager with data from local storage
const stored = localStorage.load();
if (stored) {
  console.log("Data loaded from local storage:", stored);
  projectManager = new ProjectManager(stored);
} else {
  // Create a default project if no data is found

  projectManager.addProject("defaultProject", "default project");
}

let domController = new DOMController(projectManager);

console.log(projectManager.getProjects());
// Initialize the local storage manager

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
