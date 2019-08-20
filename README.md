# Accounts & Money

Demo REST API which uses Microservice Architecture to manipulate Money Accounts.

The App consists from 5 Microservices, each has its own Docker Container.

## Usage

To run this project locally you need only [`Docker`](https://www.docker.com/):

1. Clone [this repo](https://github.com/fabritsius/accounts-with-money) (or download)
2. Run `docker-compose up` in the root of the project
3. Wait for the installation to finish⏳
4. The API is available on port `80`

## API

- `GET  /balance {userId}`
- `POST /deposit {userId, amount}`
- `POST /charge  {userId, amount}`
- `POST /authenticate {username, password}`

The API is protected by JWT Token.<br>
The token is passed in the header with the `Authorization` key.<br>
Get the token at `/authenticate` (find password in the [config.js](./api/config.js) file)

## Possible Improvements

- add Redis Caching for GET requests
- add a simple client for the API
- add API methods for adding (removing) users from the DB
