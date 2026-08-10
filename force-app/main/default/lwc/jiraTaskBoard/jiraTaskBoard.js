import { LightningElement } from 'lwc';

export default class JiraTaskBoard extends LightningElement {

    tasks = [
        {
            id: '1',
            key: 'TM-1',
            summary: 'Set up new client',
            status: 'To Do',
            priority: 'High',
            assignee: 'John'
        },
        {
            id: '2',
            key: 'TM-2',
            summary: 'Contact client',
            status: 'In Progress',
            priority: 'Medium',
            assignee: 'Sarah'
        },
        {
            id: '3',
            key: 'TM-3',
            summary: 'Prepare proposal',
            status: 'Done',
            priority: 'High',
            assignee: 'Mike'
        },
        {
            id: '4',
            key: 'TM-4',
            summary: 'Schedule meeting',
            status: 'Done',
            priority: 'Medium',
            assignee: 'Sarah'
        },
        {
            id: '5',
            key: 'TM-5',
            summary: 'Complete onboarding',
            status: 'Done',
            priority: 'Low',
            assignee: 'John'
        }
    ];

    get todoTasks() {
        return this.tasks.filter(
            task => task.status === 'To Do'
        );
    }

    get inProgressTasks() {
        return this.tasks.filter(
            task => task.status === 'In Progress'
        );
    }

    get doneTasks() {
        return this.tasks.filter(
            task => task.status === 'Done'
        );
    }
}