import { faker } from '@faker-js/faker';
/// <reference types='cypress' />

describe('Wizard bank app', () => {
  const user = 'Hermiona Granger';
  const depositAmount = faker.number.int({ min: 500, max: 1000 }).toString();
  const withdrawAmount = faker.number.int({ min: 50, max: 500 }).toString();
  let initialBalance = 0;

  before(() => {
    cy.visit('/');
  });

  it('should perform full customer flow for Hermione Granger', () => {
    cy.contains('.btn', 'Customer Login').click();
    cy.get('[name="userSelect"]').select(user);
    cy.contains('.btn', 'Login').click();

    cy.get('[ng-hide="noAccount"]').within(() => {
      cy.contains('Account Number').next('strong').then(($accNum) => {
        cy.wrap($accNum.text()).as('accountNumber');
      });
      cy.contains('Balance').next('strong').then(($bal) => {
        initialBalance = Number($bal.text());
        expect(initialBalance).to.be.a('number');
      });
    });
    cy.contains('.ng-binding', 'Dollar').should('be.visible');

    cy.get('[ng-click="deposit"]').click();
    cy.get('[placeholder="amount"]').clear();
    cy.get('[placeholder="amount"]').type(depositAmount);
    cy.contains('[type="submit"]', 'Deposit').click();

    cy.get('[ng-show="message"]').should('contain', 'Deposit Successful');
    cy.contains('[ng-hide="noAccount"]', 'Balance')
      .contains('strong', (initialBalance + Number(depositAmount)).toString())
      .should('be.visible');

    cy.get('[ng-click="withdrawl()"]').click();
    cy.get('[placeholder="amount"]').clear();
    cy.get('[placeholder="amount"]').type(withdrawAmount);

    cy.contains('[type="submit"]', 'Withdraw').click();

    cy.get('[ng-show="message"]').should('contain', 'Transaction successful');
    cy.contains('[ng-hide="noAccount"]', 'Balance')
      .contains('strong',
        (initialBalance + Number(depositAmount) - Number(withdrawAmount))
          .toString())
      .should('be.visible');

    cy.contains('.btn', 'Transactions').click();
    cy.get('table').should('be.visible');

    cy.get('table tbody tr')
      .first()
      .should('contain.text', depositAmount)
      .and('contain.text', 'Credit');

    cy.get('table tbody tr')
      .eq(1)
      .should('contain.text', withdrawAmount)
      .and('contain.text', 'Debit');

    cy.contains('.btn', 'Back').click();

    cy.get('[name="accountSelect"]').select('1003');
    cy.contains('.btn', 'Transactions').click();
    cy.get('table tbody tr').should('have.length', 0);

    cy.contains('.btn', 'Logout').click();
    cy.contains('.btn', 'Customer Login').should('be.visible');
  });
});
