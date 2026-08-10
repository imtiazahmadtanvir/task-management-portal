public with sharing class JiraTaskSync {

    public static Integer syncTasks() {

        HttpRequest req = new HttpRequest();

        req.setEndpoint(
            'callout:Jira_Named_Credential' +
            '/rest/api/3/search/jql' +
            '?jql=project%3DSAM1' +
            '&maxResults=50' +
            '&fields=summary,status,assignee,priority'
        );

        req.setMethod('GET');
        req.setHeader('Accept', 'application/json');

        Http http = new Http();
        HttpResponse res = http.send(req);

        System.debug('Jira response status: ' + res.getStatusCode());
        System.debug('Jira response body: ' + res.getBody());

        if (res.getStatusCode() != 200) {
            throw new CalloutException(
                'Jira API failed: ' +
                res.getStatusCode() +
                ' - ' +
                res.getBody()
            );
        }

        Map<String, Object> response =
            (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

        List<Object> issues =
            (List<Object>) response.get('issues');

        if (issues == null || issues.isEmpty()) {
            System.debug('No Jira issues found.');
            return 0;
        }

        Set<String> jiraKeys = new Set<String>();

        for (Object issueObj : issues) {
            Map<String, Object> issue =
                (Map<String, Object>) issueObj;

            String key = (String) issue.get('key');

            if (key != null) {
                jiraKeys.add(key);
            }
        }

        Map<String, Jira_Task__c> existingTasks =
            new Map<String, Jira_Task__c>();

        for (Jira_Task__c task : [
            SELECT Id,
                   Jira_Key__c,
                   Name,
                   Summary__c,
                   Status__c,
                   Assignee__c,
                   Priority__c,
                   Jira_URL__c
            FROM Jira_Task__c
            WHERE Jira_Key__c IN :jiraKeys
        ]) {
            existingTasks.put(task.Jira_Key__c, task);
        }

        List<Jira_Task__c> tasksToSave =
            new List<Jira_Task__c>();

        for (Object issueObj : issues) {

            Map<String, Object> issue =
                (Map<String, Object>) issueObj;

            String key = (String) issue.get('key');

            Map<String, Object> fields =
                (Map<String, Object>) issue.get('fields');

            String summary =
                (String) fields.get('summary');

            String statusName = null;

            if (fields.get('status') != null) {
                Map<String, Object> status =
                    (Map<String, Object>) fields.get('status');

                statusName =
                    (String) status.get('name');
            }

            String assigneeName = null;

            if (fields.get('assignee') != null) {
                Map<String, Object> assignee =
                    (Map<String, Object>) fields.get('assignee');

                assigneeName =
                    (String) assignee.get('displayName');
            }

            String priorityName = null;

            if (fields.get('priority') != null) {
                Map<String, Object> priority =
                    (Map<String, Object>) fields.get('priority');

                priorityName =
                    (String) priority.get('name');
            }

            Jira_Task__c task;

            if (existingTasks.containsKey(key)) {
                task = existingTasks.get(key);
            } else {
                task = new Jira_Task__c();
            }

            task.Name = summary;
            task.Summary__c = summary;

            // Map Jira statuses to the Salesforce picklist values.
            if (statusName == 'To Do') {
                task.Status__c = 'To Do';
            } else if (statusName == 'In Progress') {
                task.Status__c = 'In Progress';
            } else if (statusName == 'In Review') {
                task.Status__c = 'In Progress';
            } else if (statusName == 'Done') {
                task.Status__c = 'Done';
            } else {
                task.Status__c = 'To Do';
            }

            task.Assignee__c = assigneeName;
            task.Priority__c = priorityName;
            task.Jira_Key__c = key;

            task.Jira_URL__c =
                'https://imtiaztanvirtforce.atlassian.net/browse/' + key;

            tasksToSave.add(task);
        }

        if (!tasksToSave.isEmpty()) {
            upsert tasksToSave;
        }

        return tasksToSave.size();
    }
}