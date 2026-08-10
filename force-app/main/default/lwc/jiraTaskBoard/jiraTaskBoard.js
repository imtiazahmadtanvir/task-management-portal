import { LightningElement } from 'lwc';

import getTasks
    from '@salesforce/apex/JiraTaskBoardController.getTasks';

import refreshTasks
    from '@salesforce/apex/JiraTaskBoardController.refreshTasks';


export default class JiraTaskBoard extends LightningElement {

    // =========================================================
    // KANBAN DATA
    // =========================================================

    tasks = [];

    // =========================================================
    // LOADING / ERROR / SYNC
    // =========================================================

    isLoading = false;

    errorMessage = '';

    lastSynced = null;


    // =========================================================
    // MODAL VARIABLES
    // =========================================================

    showModal = false;

    selectedTask = null;

    accountId = null;

    accountCreated = false;


    // =========================================================
    // COMPONENT INITIALIZATION
    // =========================================================

    connectedCallback() {

        this.loadTasks();

    }


    // =========================================================
    // LOAD TASKS FROM SALESFORCE
    // =========================================================

    async loadTasks() {

        this.isLoading = true;

        this.errorMessage = '';

        try {

            const result = await getTasks();

            this.tasks = result.map(task => ({

                id: task.Id,

                key: task.Jira_Key__c,

                summary: task.Summary__c,

                status: task.Status__c,

                priority: task.Priority__c,

                assignee: task.Assignee__c,

                url: task.Jira_URL__c

            }));

            this.lastSynced = new Date();

        } catch (error) {

            console.error(
                'Unable to load Jira tasks:',
                error
            );

            this.errorMessage =
                this.getErrorMessage(error);

        } finally {

            this.isLoading = false;

        }

    }


    // =========================================================
    // MANUAL JIRA REFRESH
    // =========================================================

    async handleRefresh() {

        this.isLoading = true;

        this.errorMessage = '';

        try {

            // First call Jira and update Jira_Task__c

            await refreshTasks();


            // Then reload the updated Salesforce records

            const result = await getTasks();


            this.tasks = result.map(task => ({

                id: task.Id,

                key: task.Jira_Key__c,

                summary: task.Summary__c,

                status: task.Status__c,

                priority: task.Priority__c,

                assignee: task.Assignee__c,

                url: task.Jira_URL__c

            }));


            // Update Last Synced time

            this.lastSynced = new Date();

        } catch (error) {

            console.error(
                'Jira refresh failed:',
                error
            );

            this.errorMessage =
                this.getErrorMessage(error);

        } finally {

            this.isLoading = false;

        }

    }


    // =========================================================
    // LAST SYNCED DISPLAY
    // =========================================================

    get formattedLastSynced() {

        if (!this.lastSynced) {

            return 'Not synced yet';

        }


        return new Intl.DateTimeFormat(
            'en-US',
            {
                dateStyle: 'medium',
                timeStyle: 'short'
            }
        ).format(this.lastSynced);

    }


    // =========================================================
    // KANBAN - TO DO
    // =========================================================

    get todoTasks() {

        return this.tasks.filter(
            task => task.status === 'To Do'
        );

    }


    // =========================================================
    // KANBAN - IN PROGRESS
    // =========================================================

    get inProgressTasks() {

        return this.tasks.filter(
            task => task.status === 'In Progress'
        );

    }


    // =========================================================
    // KANBAN - DONE
    // =========================================================

    get doneTasks() {

        return this.tasks.filter(
            task => task.status === 'Done'
        );

    }


    // =========================================================
    // OPPORTUNITY STAGE
    // =========================================================

    get opportunityStage() {

        if (!this.selectedTask) {

            return 'Prospecting';

        }


        switch (this.selectedTask.status) {

            case 'To Do':

                return 'Prospecting';


            case 'In Progress':

                return 'Qualification';


            case 'Done':

                return 'Closed Won';


            default:

                return 'Prospecting';

        }

    }


    // =========================================================
    // CLICK JIRA TASK
    // =========================================================

    handleTaskClick(event) {

        const taskId =
            event.currentTarget.dataset.id;


        this.selectedTask =
            this.tasks.find(
                task => task.id === taskId
            );


        if (!this.selectedTask) {

            return;

        }


        // Reset Account state

        this.accountId = null;

        this.accountCreated = false;


        // Open modal

        this.showModal = true;

    }


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    closeModal() {

        this.showModal = false;

        this.selectedTask = null;

        this.accountId = null;

        this.accountCreated = false;

    }


    // =========================================================
    // ACCOUNT CREATED SUCCESSFULLY
    // =========================================================

    handleAccountSuccess(event) {

        // Get the newly-created Account Id

        this.accountId =
            event.detail.id;


        console.log(
            'Account created:',
            this.accountId
        );


        // Show Opportunity form

        this.accountCreated = true;

    }


    // =========================================================
    // ACCOUNT CREATION ERROR
    // =========================================================

    handleAccountError(event) {

        console.error(
            'Account creation failed:',
            event.detail
        );


        this.errorMessage =
            'Unable to create the Account. Please try again.';

    }


    // =========================================================
    // OPPORTUNITY CREATED SUCCESSFULLY
    // =========================================================

    handleOpportunitySuccess(event) {

        const opportunityId =
            event.detail.id;


        console.log(
            'Opportunity created:',
            opportunityId
        );


        // Close modal

        this.showModal = false;

        this.selectedTask = null;

        this.accountId = null;

        this.accountCreated = false;

    }


    // =========================================================
    // OPPORTUNITY CREATION ERROR
    // =========================================================

    handleOpportunityError(event) {

        console.error(
            'Opportunity creation failed:',
            event.detail
        );


        this.errorMessage =
            'Unable to create the Opportunity. Please try again.';

    }


    // =========================================================
    // ERROR MESSAGE HANDLER
    // =========================================================

    getErrorMessage(error) {

        if (
            error &&
            error.body &&
            error.body.message
        ) {

            return error.body.message;

        }


        if (
            error &&
            error.message
        ) {

            return error.message;

        }


        return 'Something went wrong. Please try again.';

    }

}