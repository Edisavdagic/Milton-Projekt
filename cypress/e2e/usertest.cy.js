// https://on.cypress.io/api

describe('Login flow', () => {
  it('viser login siden korrekt', () => {
    cy.visit('/')

    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('Log ind').should('be.visible')
    cy.screenshot
  })
})

describe('Login som bruger', () => {
  it('logger ind og redirecter til dashboard', () => {
    cy.visit('/')

    cy.get('input[type="email"]').type('test@test.com')
    cy.get('input[type="password"]').type('test1234')

    cy.contains('Log ind').click()

    // Tjek redirect
    cy.url().should('include', '/dashboard')
    cy.screenshot
  })
})