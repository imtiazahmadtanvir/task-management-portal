import { LightningElement } from 'lwc';

export default class AccountCreator extends LightningElement {
    successMessage = '';
    errorMessage = '';

    handleSuccess(event) {
        const accountId = event.detail.id;

        this.successMessage =
            'Account created successfully. Account ID: ' + accountId;

        this.errorMessage = '';
    }

    handleError(event) {
        this.errorMessage =
            event.detail?.message || 'Unable to create the Account.';

        this.successMessage = '';
    }
}