// https://on.cypress.io/api

describe('Login flow', () => {
  it('viser login siden korrekt', () => {
    cy.visit('/')

    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('Log ind').should('be.visible')
  })
})

describe('Login som admin', () => {
  it('logger ind og går til projektoversigt', () => {
    cy.visit('/')

    cy.get('input[type="email"]').type('testadmin@test.dk')
    cy.get('input[type="password"]').type('test1234')

    cy.contains('Log ind').click()

    cy.url().should('include', '/projektoversigt')
  })
})