class TodoItem {
    constructor(title, description, isCompleted = false, deadline, category) {
        this.title = title;
        this.description = description;
        this.isCompleted = isCompleted;
        this.deadline = deadline;
        this.creationDate = new Date();
        this.category = category;
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