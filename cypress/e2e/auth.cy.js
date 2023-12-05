describe("Login", () => {
	
	it("Succesful [L-1] Successful login with verified user should redirect to home", () => {
		
		cy.login();
		cy.visit("/");
		cy.url().should(
			"eq",
			"http://pruebas-soft.s3-website.us-east-2.amazonaws.com/"
		);

	});
	
	it("[Error L-2] invalid credentials", () => {
		cy.visit("/login", {
			failOnStatusCode: false,
		});
		cy.get('input[id="login-email"').type("correo@incorrecto.cl");
		cy.get('input[id="login-password"').type("correo");
		cy.get("button").click();

		cy.get(".text-negative").should("text", "invalid credentials");
	});
});
