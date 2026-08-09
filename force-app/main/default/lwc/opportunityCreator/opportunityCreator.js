import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';

import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import CLOSE_DATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';
import STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';
import ACCOUNT_FIELD from '@salesforce/schema/Opportunity.AccountId';

export default class OpportunityCreator extends LightningElement {

    opportunityName = '';
    amount;
    closeDate;
    stageName = '';
    accountId = '';
    message = '';

    stageOptions = [
        { label: 'Prospecting', value: 'Prospecting' },
        { label: 'Qualification', value: 'Qualification' },
        { label: 'Needs Analysis', value: 'Needs Analysis' },
        { label: 'Value Proposition', value: 'Value Proposition' },
        { label: 'Id. Decision Makers', value: 'Id. Decision Makers' },
        { label: 'Perception Analysis', value: 'Perception Analysis' },
        { label: 'Proposal/Price Quote', value: 'Proposal/Price Quote' },
        { label: 'Negotiation/Review', value: 'Negotiation/Review' },
        { label: 'Closed Won', value: 'Closed Won' },
        { label: 'Closed Lost', value: 'Closed Lost' }
    ];

    handleChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    handleAccountChange(event) {
        this.accountId = event.detail.value;
    }

    async createOpportunity() {

        if (!this.opportunityName || !this.closeDate || !this.stageName) {
            this.message = 'Please fill in all required fields.';
            return;
        }

        const fields = {};

        fields[NAME_FIELD.fieldApiName] = this.opportunityName;
        fields[AMOUNT_FIELD.fieldApiName] = this.amount;
        fields[CLOSE_DATE_FIELD.fieldApiName] = this.closeDate;
        fields[STAGE_FIELD.fieldApiName] = this.stageName;

        if (this.accountId) {
            fields[ACCOUNT_FIELD.fieldApiName] = this.accountId;
        }

        try {
            const record = await createRecord({
                apiName: OPPORTUNITY_OBJECT.objectApiName,
                fields
            });

            this.message = `Opportunity created successfully. Opportunity ID: ${record.id}`;

        } catch (error) {
            this.message =
                'Error creating Opportunity: ' +
                (error.body?.message || error.message);
        }
    }
}