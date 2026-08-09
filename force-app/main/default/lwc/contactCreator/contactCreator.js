import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getAccounts from '@salesforce/apex/ContactCreatorController.getAccounts';
import createContact from '@salesforce/apex/ContactCreatorController.createContact';

export default class ContactCreator extends LightningElement {

    firstName = '';
    lastName = '';
    email = '';
    accountId = '';

    accountOptions = [];

    @wire(getAccounts)
    wiredAccounts({ data, error }) {
        if (data) {
            this.accountOptions = data.map(account => ({
                label: account.Name,
                value: account.Id
            }));
        } else if (error) {
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

    handleAccountChange(event) {
        this.accountId = event.detail.value;
    }

    handleCreateContact() {

        if (!this.lastName || !this.accountId) {
            this.showToast(
                'Missing Information',
                'Please enter Last Name and select an Account.',
                'warning'
            );
            return;
        }

        createContact({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            accountId: this.accountId
        })
        .then(() => {

            this.showToast(
                'Success',
                'Contact created successfully!',
                'success'
            );

            this.firstName = '';
            this.lastName = '';
            this.email = '';
            this.accountId = '';

        })
        .catch(error => {

            this.showToast(
                'Error',
                error.body?.message || 'Unable to create Contact.',
                'error'
            );

        });
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