/** @type {import("eslint").Linter.Config} */
module.exports = {
	root: true,
	extends: ["@serenityjs/eslint-config/rust.js"],
	parserOptions: {
		project: true
	}
};
