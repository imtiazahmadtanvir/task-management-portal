public with sharing class JiraTaskBoardController {

    @AuraEnabled
    public static List<Jira_Task__c> getTasks() {

        try {

            return [
                SELECT Id,
                       Name,
                       Summary__c,
                       Status__c,
                       Assignee__c,
                       Priority__c,
                       Jira_Key__c,
                       Jira_URL__c
                FROM Jira_Task__c
                ORDER BY CreatedDate DESC
                LIMIT 200
            ];

        } catch (Exception e) {

            throw new AuraHandledException(
                'Unable to load Jira tasks: ' + e.getMessage()
            );
        }
    }


    @AuraEnabled
    public static Integer refreshTasks() {

        try {

            return JiraTaskSync.syncTasks();

        } catch (System.CalloutException e) {

            throw new AuraHandledException(
                'Jira connection failed. Please try again. ' +
                e.getMessage()
            );

        } catch (System.LimitException e) {

            throw new AuraHandledException(
                'Salesforce limit reached while syncing Jira. ' +
                e.getMessage()
            );

        } catch (Exception e) {

            throw new AuraHandledException(
                'Jira sync failed: ' + e.getMessage()
            );
        }
    }
}