declare module "@salesforce/apex/ContactCreatorController.getAccounts" {
  export default function getAccounts(): Promise<any>;
}
declare module "@salesforce/apex/ContactCreatorController.createContact" {
  export default function createContact(param: {firstName: any, lastName: any, email: any, accountId: any}): Promise<any>;
}
