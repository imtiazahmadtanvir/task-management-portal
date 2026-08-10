import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getAccounts from '@salesforce/apex/ContactCreatorController.getAccounts';
import createContact from '@salesforce/apex/ContactCreatorController.createContact';

export default class ContactCreator extends LightningElement {

    firstName = '';
    lastName = '';
    email = '';
    phone = '';
    accountId = '';

    accountOptions = [];
    errorMessage = '';
    successMessage = '';
    isLoading = false;

    @wire(getAccounts)
    wiredAccounts({ data, error }) {
        if (data) {
            this.accountOptions = data.map(account => ({
                label: account.Name,
                value: account.Id
            }));
        } else if (error) {
            this.errorMessage = 'Unable to load Accounts.';
            this.showToast(
                'Error',
                'Unable to load Accounts.',
                'error'
            );
        }
    }

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }

    handleAccountChange(event) {
        const val = event.detail?.value || event.target?.value;
        if (Array.isArray(val)) {
            this.accountId = val.length > 0 ? val[0] : '';
        } else {
            this.accountId = val || '';
        }
    }

    handleCreateContact() {
        this.errorMessage = '';
        this.successMessage = '';

        let cleanAccountId = this.accountId;
        if (Array.isArray(cleanAccountId)) {
            cleanAccountId = cleanAccountId.length > 0 ? cleanAccountId[0] : '';
        }

        if (!this.lastName || !this.lastName.trim()) {
            this.errorMessage = 'Please enter Last Name.';
            this.showToast(
                'Missing Information',
                this.errorMessage,
                'warning'
            );
            return;
        }

        if (!cleanAccountId) {
            this.errorMessage = 'Please select an Account.';
            this.showToast(
                'Missing Information',
                this.errorMessage,
                'warning'
            );
            return;
        }

        this.isLoading = true;

        createContact({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            accountId: cleanAccountId
        })
        .then(recordId => {
            this.isLoading = false;
            this.successMessage = 'Contact created successfully. Contact ID: ' + recordId;
            this.errorMessage = '';

            this.showToast(
                'Success',
                'Contact created successfully!',
                'success'
            );

            this.firstName = '';
            this.lastName = '';
            this.email = '';
            this.phone = '';
            this.accountId = '';
        })
        .catch(error => {
            this.isLoading = false;
            this.errorMessage = this.extractErrorMessage(error);
            this.successMessage = '';

            this.showToast(
                'Error',
                this.errorMessage,
                'error'
            );
        });
    }

    extractErrorMessage(error) {
        let msg = '';
        if (error && error.body && error.body.message) {
            msg = error.body.message;
        } else if (error && error.body && Array.isArray(error.body.pageErrors) && error.body.pageErrors.length > 0) {
            msg = error.body.pageErrors[0].message;
        } else if (error && error.message) {
            msg = error.message;
        } else {
            msg = 'An error occurred while trying to create the record. Please try again.';
        }

        if (msg && msg.includes('Use one of these records')) {
            return 'Duplicate record detected: A Contact with similar details (Email, Name, or Phone) already exists in Salesforce.';
        }

        return msg;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}