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

  addTask(name, description, dueDate, priority) {
    const newToDo = new TodoItem(name, description, false, dueDate, priority);


    this.currentProject.addTask(newToDo);

    // Save the updated projects to local storage
    this.projects = this.projects.map((project) =>
      project.guid === this.currentProject.guid ? this.currentProject : project
    );

    localStorage.save(this.projects);
  }

  removeTask(taskName) {
    const project = this.currentProject
    if (project) {
      project.removeTask(taskName);
      localStorage.save(this.projects);
    }
  }

  updateTask(task) {
    const project = this.currentProject;
    if (project) {
      const taskToUpdate = project.getTasks().find((t) => t.title === task.title);
      if (taskToUpdate) {
        taskToUpdate.description = task.description;
        taskToUpdate.completed = task.completed;
        taskToUpdate.dueDate = task.dueDate;
        taskToUpdate.priority = task.priority;
        localStorage.save(this.projects);
      }
    }
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

    if (typeof project.getTasks !== "function") {
        console.error("Project.getTasks is not a function");
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



  rehydrateProjects(storedProjects) {

    if (!storedProjects) return;

    this.projects = storedProjects.map((projectData) => {
      const project = new Project(projectData.name, projectData.description);
      project.guid = projectData.guid;
      project.tasks = projectData.tasks.map(
        (task) =>
          new TodoItem(
            task.title,
            task.description,
            task.completed,
            task.dueDate,
            task.priority
          )
      );
      return project;
    });
  }
}

export default ProjectManager;
