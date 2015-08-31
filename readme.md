# Grunt tasks

* `grunt develop` - Builds code and watches for changes
* `grunt tests` - Run the unit tests
* `grunt pre-commit` - Runs the linter and builds the code. Also copies the appropriate files into dist.
* `grunt update` - Gets the latest selenium webdriver and chromedriver

# How to update this project

# Make code changes (make sure you run `grunt pre-commit` to update the contents of "dist"), and create a PR / push changes
# Increment version # in package.json (use semantic versioning)
# Publish a tag with the version number (`git tag v0.0.1; git push origin --tags;`)
# (To use new version from another project, update reference in package.json to point to the new tag)