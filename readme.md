# Agro Assistance Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue)

This is the backend repo for agro assistance

## Technologies

-   Node
-   Typescript
-   Express
-   Mongoose

## Linters

-   Eslint
-   Prettier

## Prerequisites

Before you begin, ensure you have met the following requirements:

-   [Node.js](https://nodejs.org/) (18.x or higher) installed on your system.
-   Clone or download this repository to your local machine.
-   A code editor of your choice, like Visual Studio Code.

## Setup

1.  Clone the repository to your local machine:

    ```bash
    git clone git@github.com:Klusterthon-96/backend.git
    cd backend
    ```

2.  Install the project dependencies using [npm](https://www.npmjs.com/):

    ```bash
    npm install
    ```

3.  Create a `.env` file in the project root and add the following environment variables example in the .env.sample file

4.  Start the development server:

```bash
npm run watch (run this in one terminal in the project directory)
npm run dev (this in another terminal in the project directory)
```

### Setup Docker

To use docker locally, follow these steps:

1.  Make sure that you have Docker installed on your system
2.  Run

```bash
npm run start:docker
```

## APIs

-   **Authentication**: Secure user registration, login, and JWT token generation.
-   **User**: Manage user profiles, update information, and view user details.
-   **Admin**: Admin-only endpoints for managing the application.
-   **Predict**: Prediction endpoints
-   **Offline**: USSD Offline access

## Postman Documentation

This is the link to the [Postman documentation](https://documenter.getpostman.com/view/17957003/2s9YeEarLk)

## Contributing

Contributions are welcome! Feel free to submit issues, create pull requests, or open discussions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Happy Coding!** 🚀
