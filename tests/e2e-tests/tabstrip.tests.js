describe('Clicking on the tabs ', function() {
	var tabstrip;	

	beforeEach(function() { 
		// Select tabstrip by css
		browser.get('/');
		tabstrip = $("ion-tabs");
	});

	it(' should switch to status tab on click', function() {
		var statusTab = tabstrip.all(by.css('a')).get(0);
		statusTab.click().then(function() {
			expect(browser.getLocationAbsUrl()).toMatch('/tab/tag');
		});
	});

	it(' should switch to settings tab on click', function() {
		var settingsTab = tabstrip.all(by.css('a')).get(1);
		settingsTab.click().then(function() {
			expect(browser.getLocationAbsUrl()).toMatch('/tab/settings');
		});
	});

});

