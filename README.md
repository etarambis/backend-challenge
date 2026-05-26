# Cursor BackEnd Challenge

### Features

- Create new Users with their Pokemon Ids
- Get Users List
- Get User By Id Also gathering Pokemon Names From Poke Api
- Update User 
- Delete User 

### Pre-Requisities

- Docker installed without SUDO Permission
- Docker compose installed without SUDO
- Ports free: 3000 and 5432

# How to run the APP

```
chmod 711 ./up_dev.sh
./up_dev.sh
```

# How to run the tests

```
chmod 711 ./up_test.sh
./up_test.sh
```

## Areas to improve

- Data should be moved from tests to an external file
- Generic method should be used to mock endpoints
- Error handling could be improved (I.E. handle already existing user error)
- A seed migration would be useful to have an already working app with data
- The ORM is being used with Synchronize instead of migrations. Migrations would be the best option

## Errors to be fixed 

- Docker app is not running properly

## Techs 

- Nest: 11
- Node
- TypeORM
- Postgres

## Route

- API Swagger: [http://localhost:3000/api](http://localhost:3000/api)

## Env vars should be defined 

To find an example of the values you can check `.env.example`
