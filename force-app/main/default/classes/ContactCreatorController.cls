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
        String phone,
        Id accountId
    ) {
        Contact newContact = new Contact(
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            AccountId = accountId
        );

        try {
            Database.DMLOptions dml = new Database.DMLOptions();
            dml.DuplicateRuleHeader.allowSave = true;
            dml.DuplicateRuleHeader.runAsCurrentUser = true;

            Database.SaveResult sr = Database.insert(newContact, dml);
            if (!sr.isSuccess()) {
                String errorMsg = '';
                for (Database.Error err : sr.getErrors()) {
                    errorMsg += err.getMessage() + ' ';
                }
                AuraHandledException ex = new AuraHandledException(errorMsg.trim());
                ex.setMessage(errorMsg.trim());
                throw ex;
            }

            return newContact.Id;
        } catch (Exception e) {
            String msg = e.getMessage();
            AuraHandledException ex = new AuraHandledException(msg);
            ex.setMessage(msg);
            throw ex;
        }
    }
}