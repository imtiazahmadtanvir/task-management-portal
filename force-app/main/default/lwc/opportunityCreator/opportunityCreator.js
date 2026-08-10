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

    // ============================================
    // NORMAL FIELD CHANGES
    // ============================================

    handleChange(event) {

        const field = event.target.dataset.field;

        this[field] = event.target.value;
    }


    // ============================================
    // ACCOUNT CHANGE
    // ============================================

    handleAccountChange(event) {

        const value = event.detail.value;

        // Some lookup components return an array.
        // Opportunity.AccountId requires ONE Salesforce ID.

        if (Array.isArray(value)) {

            this.accountId = value.length > 0
                ? value[0]
                : '';

        } else {

            this.accountId = value || '';

        }

        console.log('Account ID:', this.accountId);
        console.log(
            'Account ID is array:',
            Array.isArray(this.accountId)
        );
    }


    // ============================================
    // CREATE OPPORTUNITY
    // ============================================

    async createOpportunity() {

        this.message = '';

        // Make absolutely sure AccountId is a single value.

        if (Array.isArray(this.accountId)) {

            this.accountId =
                this.accountId.length > 0
                    ? this.accountId[0]
                    : '';
        }


        // Validate required fields.

        if (
            !this.opportunityName ||
            !this.closeDate ||
            !this.stageName
        ) {

            this.message =
                'Please fill in all required fields.';

            return;
        }


        // ============================================
        // BUILD OPPORTUNITY
        // ============================================

        const fields = {};

        fields[NAME_FIELD.fieldApiName] =
            this.opportunityName;

        if (this.amount !== undefined && this.amount !== null && this.amount !== '') {

            fields[AMOUNT_FIELD.fieldApiName] =
                this.amount;
        }

        fields[CLOSE_DATE_FIELD.fieldApiName] =
            this.closeDate;

        fields[STAGE_FIELD.fieldApiName] =
            this.stageName;


        // ============================================
        // ACCOUNT RELATIONSHIP
        // ============================================

        if (this.accountId) {

            fields[ACCOUNT_FIELD.fieldApiName] =
                this.accountId;
        }


        console.log(
            'Creating Opportunity with fields:',
            JSON.stringify(fields)
        );


        // ============================================
        // CREATE RECORD
        // ============================================

        try {

            const record = await createRecord({

                apiName:
                    OPPORTUNITY_OBJECT.objectApiName,

                fields

            });


            this.message =
                'Opportunity created successfully. Opportunity ID: ' +
                record.id;


            console.log(
                'Opportunity created:',
                record.id
            );


        } catch (error) {

            console.error(
                'Opportunity creation error:',
                error
            );


            this.message =
                'Error creating Opportunity: ' +
                (
                    error.body?.message ||
                    error.message ||
                    'Unknown error'
                );
        }
    }
}