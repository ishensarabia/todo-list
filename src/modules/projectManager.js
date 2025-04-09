import Project from "./project.js";
class ProjectManager {
  constructor() {
    this.projects = [];
  }

  addProject(projectName) {
    const newProject = new Project(projectName);
    this.projects.push(newProject);
  }

  removeProject(projectGuid) {
    this.projects = this.projects.filter(
      (project) => project.guid !== projectGuid
    );
  }

  getProject(projectGuid) {
    return this.projects.find((project) => project.guid === projectGuid);
  }

  getProjects() {
    return this.projects;
  }
}

export default ProjectManager;
