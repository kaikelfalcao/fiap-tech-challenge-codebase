npm run migration:generate --name=CreateUsers --module=users
npm run migration:create --name=AddIndex --module=users
npm run migration:show
npm run migration:run
npm run migration:revert
