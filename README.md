# Accounts with Money

Demo REST API Application which uses Microservice Architecture to manipulate Money Accounts.

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
The token is passed in the header with the `x-app-token` key.<br>
Get the token at `/authenticate` (find password in the [config.js](./config.js) file)
