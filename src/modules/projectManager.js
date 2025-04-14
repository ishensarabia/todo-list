import Project from "./project.js";
import TodoItem from "./todoItem.js";
import LocalStorageManager from "./localStorage.js";

// Save to local storage
const localStorage = new LocalStorageManager("todoAppData");

class ProjectManager {
  constructor(projects) {
    this.projects = projects || [];
    this.currentProject;
  }

  addProject(projectName, projectDescription) {
    const newProject = new Project(projectName, projectDescription);
    this.projects.push(newProject);

    localStorage.save(this.projects);
  }

  removeProject(projectGuid) {
    this.projects = this.projects.filter(
      (project) => project.guid !== projectGuid
    );
    localStorage.save(this.projects);
  }

  getProject(projectGuid) {
    return this.projects.find((project) => project.guid === projectGuid);
  }

  getProjects() {
    return this.projects;
  }

  getTodosForProject(projectGuid) {
    const project = this.getProject(projectGuid);

    if (!project) {
      console.error("Project not found");
      return [];
    }

    if (project.getTasks().length === 0) {
      console.error("No tasks available for this project");
      return [];
    }
    return project.getTasks();
  }

  setCurrentProject(project) {
    this.currentProject = project;
  }

  getCurrentProject() {
    return this.currentProject;
  }

  addToDo(name, description, dueDate, priority) {
    const newToDo = new TodoItem(name, description, false, dueDate, priority);

    this.currentProject.addTask(newToDo);
  }
}

export default ProjectManager;
