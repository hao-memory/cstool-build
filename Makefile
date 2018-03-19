
publish:
	npm run build
	npm publish

publish-sync: publish
	cnpm sync rstool-build
	tnpm sync rstool-build

