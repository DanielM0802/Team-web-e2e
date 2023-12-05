describe("Club", () => {
	it("[SUCCESS C-1] club details", () => {
		cy.login().then((token) => {
			cy.getClubs(token).then((clubes) => {
				cy.visit("/", {
					failOnStatusCode: false,
				});
				cy.get(`div[id=${clubes[0]._id}]`).click();
				cy.get('span[class="text-h3"]').contains(clubes[0].name);
			});
		});
	});

	it("[C-2] Redirect to login page without token", () => {
		// Limpiar el localStorage para eliminar el token
		cy.clearLocalStorage();
		cy.visit(`/club`, {
			failOnStatusCode: false,
		});
        cy.url().should("eq", "http://pruebas-soft.s3-website.us-east-2.amazonaws.com/login");
    });

	const generateRandomMemberData = () => {
		return {
		  name: "John" + Math.floor(Math.random() * 1000),
		  lastname: "Doe" + Math.floor(Math.random() * 1000),
		  email: "test" + Math.floor(Math.random() * 1000) + "@example.com",
		  dni: Math.floor(Math.random() * 1000000000).toString(),
		  nickname: "johndoe" + Math.floor(Math.random() * 1000),
		};
	  };


	it("ERROR [C-3] Add Member to Club", () => {
		const memberData = generateRandomMemberData();

        cy.login().then((token) => {
            cy.getClubs(token).then((clubes) => {
	 			cy.visit("/", {
	 				failOnStatusCode: false,
	 			});
				
				cy.intercept('GET', '**/clubs/*/members').as('clubMembersRequest');

	 			cy.get(`div[id=${clubes[0]._id}]`).click();

				cy.wait('@clubMembersRequest');

				let memberCountBefore;
				cy.get('.text-h6').contains('Members').invoke('text').then(text => memberCountBefore = parseInt(text.match(/\d+/)[0]));

				cy.get('div[for="add-member"]').click();

				for (const fieldName in memberData) {
					cy.get(`input[name=member-${fieldName}]`).type(memberData[fieldName]);
				}

				cy.get('button:contains("Add Member")').click();
				cy.wait('@clubMembersRequest');

				let memberCountAfter;
				cy.get('.text-h6').contains('Members').invoke('text').then((text) => {
                    memberCountAfter = parseInt(text.match(/\d+/)[0]);
					// Verificar que el listado aumentó en 1 en pagina
					expect(memberCountAfter).to.eq(memberCountBefore + 1);
                });
				// Verificar que el listado aumentó en 1
				cy.getClubMembers(clubes[0]._id, token).then(members => expect(members.length).to.eq(memberCountBefore + 1));

            });
        });
    });


	it("ERROR [C-4] Fail to Add Member due to Missing Email", () => {
		const memberData = generateRandomMemberData();
		memberData.email = " "; // campo email vacío
	  
		cy.login().then((token) => {
		  cy.getClubs(token).then((clubes) => {
			cy.visit("/", {
			  failOnStatusCode: false,
			});
	  
			cy.intercept("GET", "**/clubs/*/members").as("clubMembersRequest");
	  
			// Visitar la página del club específico
			cy.get(`div[id=${clubes[0]._id}]`).click();
	  
			cy.wait("@clubMembersRequest");
	  
			let memberCountBefore;
			cy.get('.text-h6').contains('Members').invoke('text').then(text => memberCountBefore = parseInt(text.match(/\d+/)[0]));

			cy.get('div[for="add-member"]').click();
	  
			for (const fieldName in memberData) {
			  cy.get(`input[name=member-${fieldName}]`).type(memberData[fieldName]);
			}
	  
			cy.get('button:contains("Add Member")').click();
	  
			cy.get(".text-negative.text-center").should(
				"have.text",
				"email is required and must be a valid email"
			  );
	  
			// Obtener el contador de miembros después de intentar agregar uno nuevo
			let memberCountAfter;
			cy.get(".text-h6").contains("Members").invoke("text").then((text) => {
			  memberCountAfter = parseInt(text.match(/\d+/)[0]);
			  // Verificar que el listado no aumentó en 1
			  expect(memberCountAfter).to.eq(memberCountBefore);
			});
		  });
		});
	});

	it("[ERROR C-5] show notification with text unavailable when clicking on delete member button", () => {
		cy.login().then((token) => {
		  cy.getClubs(token).then((clubs) => {
			// Seleccionar el primer club
			const firstClub = clubs[0];
	  
			// Establecer el club activo en el localStorage
			cy.window().then((win) => {
			  win.localStorage.setItem("club", JSON.stringify({ active: firstClub }));
			});
	  
			cy.visit("/club", {
			  failOnStatusCode: false,
			});


			cy.get('tbody tr')
			.should('exist') 
			.first()
			.find('button:contains("delete_forever")')
			.should('exist') 
			.click();
		  
			// Verificar que la notificación con el texto "Unavailable" se muestra
			cy.get('.q-notification__message').should('have.text', 'Unavailable');
		  });
		});
	});
});
