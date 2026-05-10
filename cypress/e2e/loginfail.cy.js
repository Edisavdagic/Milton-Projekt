describe('Login fejl', () => {
  it('viser fejlbesked ved forkert login', () => {
    cy.visit('/');

    cy.get('input[type="email"]').type('forkert@test.dk');
    cy.get('input[type="password"]').type('forkertkode');
    cy.screenshot();

    cy.contains('Log ind').click();

    cy.get('.login__error')
      .should('be.visible')
      .and('contain', 'Ugyldig e-mail eller adgangskode.');
      cy.screenshot();
  });
});