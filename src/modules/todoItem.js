class TodoItem {
    constructor(title, description, isCompleted = false, dueDate, priority) {
        this.title = title;
        this.description = description;
        this.isCompleted = isCompleted;
        this.dueDate = dueDate;
        this.creationDate = new Date();
        this.priority = priority;
    }

    markAsCompleted() {
        this.isCompleted = true;
    }

    updateTitle(newTitle) {
        this.title = newTitle;
    }

    updateDescription(newDescription) {
        this.description = newDescription;
    }

    toggleCompletion() {
        this.isCompleted = !this.isCompleted;
    }
}

export default TodoItem;