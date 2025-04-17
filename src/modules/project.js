class Project {
  constructor(name, description, guid) {
    this.name = name;
    this.description = description;
    this.guid = guid || this.generateUniqueId();
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push(task);
  }

  removeTask(taskName) {
    this.tasks = this.tasks.filter((task) => task.title !== taskName);
  }

  updateTask(task) {
    const taskToUpdate = this.tasks.find((t) => t.title === task.title);
    if (taskToUpdate) {
      taskToUpdate.description = task.description;
      taskToUpdate.completed = task.completed;
      taskToUpdate.dueDate = task.dueDate;
      taskToUpdate.priority = task.priority;
    }
  }

  getTasks() {
    return this.tasks;
  }

  generateUniqueId() {
    return "_" + Math.random().toString(36).substring(2, 9);
  }
}

export default Project;
