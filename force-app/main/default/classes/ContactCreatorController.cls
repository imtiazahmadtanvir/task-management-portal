public with sharing class ContactCreatorController {

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [
            SELECT Id, Name
            FROM Account
            ORDER BY Name
            LIMIT 100
        ];
    }

    @AuraEnabled
    public static Id createContact(
        String firstName,
        String lastName,
        String email,
        Id accountId
    ) {
        Contact newContact = new Contact(
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            AccountId = accountId
        );

        insert newContact;

        return newContact.Id;
    }
}