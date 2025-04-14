class Project {
    constructor(name, description, ) {
        this.name = name;
        this.description = description;
        this.guid = this.generateUniqueId();
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push(task);
    }

    removeTask(taskName) {
        this.tasks = this.tasks.filter(task => task.title !== taskName);
    }

    getTasks() {
        return this.tasks;
    }

    generateUniqueId() {
        return '_' + Math.random().toString(36).substring(2, 9);
    }
}

export default Project;