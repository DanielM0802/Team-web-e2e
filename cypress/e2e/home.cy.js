describe("Home", () => {
	it("[Error H-1] Redirect to /login page when token is not provided", () => {
		cy.visit("/");
		cy.url().should(
			"eq",
			"http://pruebas-soft.s3-website.us-east-2.amazonaws.com/login"
		);
	});


    it("[H-2] Welcome user with valid token", () => {

		cy.login();
		cy.visit(`/`); 
		cy.get("h2").should("have.text", `Welcome DANIEL,`); 

	});


	it("[H-3] Obtain list of clubs with valid token", () => {
        cy.login().then((token) => {
            cy.getClubs(token).then((clubs) => {
                // Verificar que al menos hay un club en el listado
                expect(clubs.length).to.be.greaterThan(0);
                cy.visit("/");
                // Verificar que el nombre del club está presente en la página
                cy.contains(clubs[0].name).should("exist");
            });
        });
    });

	it("[H-4] Add Club with valid token", () => {
		cy.login().then((token) => {
			// Obtener la cantidad de clubes antes de agregar uno nuevo
			cy.getClubs(token).then((clubsBefore) => {
				const initialClubCount = clubsBefore.length;
	
				cy.visit("/");
				cy.contains("Add Club").click();
	
				const newClubName = "Nuevo Club " + Math.random().toString(36).substring(7);
				const newClubDescription = "Descripción del Nuevo Club";
	
				cy.get('input[aria-label="Club name"]').type(newClubName);
				cy.get('input[aria-label="Club description"]').type(newClubDescription);
	
				cy.get('button:contains("Add Club")').click();
	
				// Confirmar que el nombre que se muestra coincide con el del nuevo club
				cy.contains('.text-h3', newClubName);
	
				// Verificar que el listado aumenta en 1
				cy.getClubs(token).then((clubsAfter) => {
					const finalClubCount = clubsAfter.length;
					expect(finalClubCount).to.eq(initialClubCount + 1);
				});
			});
		});
	});

	it("[H-5] Fail to add Club due to missing name", () => {
		cy.login()

		cy.visit("/");
		cy.contains("Add Club").click();
		cy.get('button:contains("Add Club")').click();

		// Verificar que se muestra el mensaje de error "name is required"
		cy.contains('.text-negative', 'name is required');
	});
	

});