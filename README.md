# Oath Anti-Dump

**Don't Get Rugged. Get Verified.**

Oath is a protocol built on Solana to bring accountability to the memecoin space and protect investors from "rug pulls". It allows token creators to make an "oath" to their community, locking a portion of their tokens in a smart contract that are only released when certain milestones are met.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-green)](https://oathantidump.vercel.app/)
[![Pitch Video](https://img.shields.io/badge/Pitch-Watch_Video-red)](https://www.youtube.com/watch?v=ywET6xvWkv0)
[![Technical Demo](https://img.shields.io/badge/Technical_Demo-Watch_Video-blue)](https://www.youtube.com/watch?v=MPowMdJmh-4)

## The Problem

The rise of platforms like pump.fun has made it incredibly easy to launch new tokens on Solana. While this has spurred innovation, it has also led to a surge in scams, particularly "rug pulls," where creators drain liquidity and abandon the project, leaving investors with worthless tokens. This erodes trust and makes it difficult for legitimate projects to succeed.

## Our Solution: The Oath

Oath introduces a new primitive: an on-chain, time-locked commitment made by token creators. Here's how it works:

1.  **Create an Oath**: A token creator locks a percentage of their token supply into our smart contract.
2.  **Set Milestones**: The creator defines specific, measurable goals (e.g., reaching a certain market cap, getting listed on an exchange, shipping a feature).
3.  **Build Trust**: The oath is publicly visible on our platform. Investors can see the creator's commitment and the conditions for the token release.
4.  **Unlock Tokens**: When a milestone is verifiably met, a portion of the locked tokens is released to the creator. This incentivizes long-term development and aligns the creator's interests with the community's.

By making commitments transparent and binding, Oath brings a new level of accountability and helps investors differentiate between legitimate projects and potential scams.

## Features

*   **Browse Projects**: Discover new and existing tokens that have taken an oath.
*   **View Oaths**: See the details of each oath, including the amount of locked tokens and the release milestones.
*   **Protocol Statistics**: View aggregate data on the number of oaths, total value locked, and more.
*   **On-Chain Verification**: All oaths and token locks are managed by a Solana smart contract, ensuring transparency and security.

## Tech Stack

This project is a monorepo containing the backend, frontend, and smart contract.

*   **Backend**:
    *   Language: **Rust**
    *   Web Framework: **Axum**
    *   Async Runtime: **Tokio**
    *   ORM: **SeaORM** for database interactions.
*   **Frontend**:
    *   Framework: **React**
    *   Build Tool: **Vite**
    *   Styling: **Tailwind CSS**
    *   Solana Integration: **@solana/wallet-adapter-react**
    *   Data Fetching: **@tanstack/react-query**
*   **Smart Contract**:
    *   Written in **Rust** using the **Anchor** framework for Solana.

## Project Structure

The repository is organized as follows:

```
/
├── backend/        # Rust-based backend server (Axum)
├── contract/       # Solana smart contract (Anchor)
├── frontend/       # React frontend application (Vite)
└── plugin/         # Browser plugin (in development)
```

## Getting Started

To run this project locally, you will need to set up the backend and frontend separately.

### Backend Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend/rust_backend
    ```
2.  **Install Rust dependencies**:
    ```bash
    cargo build
    ```
3.  **Run the server**:
    ```bash
    cargo run
    ```
    The backend API will be available at `http://localhost:3000`.

### Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend/web3
    ```
2.  **Install Node.js dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:5173`.

---

Built for the Colosseum Hackathon.

Pitch:
https://www.youtube.com/watch?v=ywET6xvWkv0

Technical Demo:
https://www.youtube.com/watch?v=MPowMdJmh-4
