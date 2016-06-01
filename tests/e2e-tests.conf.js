// Configuration for Protractor
// Adapted from: http://gonehybrid.com/how-to-write-automated-tests-for-your-ionic-app-part-3/

exports.config = {

	// Set browsers
	capabilities: {
		'browserName': 'firefox'
	},
	
	// Base URL is that of ionic serve
	baseUrl: 'http://localhost:8100',

	// Where to find the specs for the tests
	specs: [
		'e2e-tests/**/*.tests.js'
	],

	// Get more verbose output from Jasmine
	jasmineNodeOpts: {
		isVerbose: true
	}
};
