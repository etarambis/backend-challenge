# Cursor BackEnd Challenge

You have to build a microservice that exposes a REST api with two different tables, users anda states. Both tables should be open to creation, deletion, or update.Every request must only accept this Content-types

## App runnig on

- [SWAGGER](https://dry-wave-78186-57dffe04a6e4.herokuapp.com/api#)

### Badge

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/etarambis/backend-challenge/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/etarambis/backend-challenge/tree/master)

[![Coverage Status](https://coveralls.io/repos/github/etarambis/backend-challenge/badge.svg)](https://coveralls.io/github/etarambis/backend-challenge)

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
- Node: 24.13.1
- TypeORM
- Postgres

## Decisions made

- Jest/Testing/E2E: Jest is the most used testing framework of JS. Same argument as above. E2E testing was donde because it is useless to always test every single part. 
That is why if tjhe controller provide the proper answer the test has passed.

##


## Route

- local: [API Swagger](http://localhost:3000/api)

## Env vars should be defined 

To find an example of the values you can check `.env.example`
