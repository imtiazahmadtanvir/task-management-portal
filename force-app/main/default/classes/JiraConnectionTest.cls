public with sharing class JiraConnectionTest {

    public static String testConnection() {

        HttpRequest req = new HttpRequest();

        req.setEndpoint(
            'callout:Jira_Named_Credential/rest/api/3/search/jql' +
            '?jql=project%3DSAM1' +
            '&maxResults=10' +
            '&fields=summary,status,assignee,priority'
        );

        req.setMethod('GET');
        req.setHeader('Accept', 'application/json');

        Http http = new Http();
        HttpResponse res = http.send(req);

        System.debug('STATUS CODE: ' + res.getStatusCode());
        System.debug('RESPONSE: ' + res.getBody());

        return res.getBody();
    }
}