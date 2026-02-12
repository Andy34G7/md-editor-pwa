# Serverless Markdown Editor PWA

A serverless, progressive web application for editing Markdown files directly from your Google Drive. Built with React, Vite, and Google Identity Services.

## Features

-   **Google Drive Integration**: Seamlessly open, edit, save, rename, and create Markdown files in your Drive.
-   **Folder Support**: Navigate your Drive folders to organize your documents.
-   **Offline Capable**: Installable as a PWA for offline editing access.
-   **Split-Pane View**: Real-time preview of your Markdown with syntax highlighting.
-   **Customization**: Dark/Light mode toggle and customizable preview fonts (Inter, Merriweather, Fira Code, etc.).
-   **Local Export**: Download your files as `.md` to your local device.

## Prerequisites

To run this project, you need a Google Cloud Project with the Drive API enabled.

### Google Cloud Setup

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project and enable the **Google Drive API**.
3.  Configure the **OAuth Consent Screen** (User Type: External). Add your email as a test user.
4.  Create Credentials > **OAuth Client ID** (Application type: Web application).
    -   **Authorized JavaScript origins**: `http://localhost:5173`
    -   **Authorized redirect URIs**: `http://localhost:5173`
5.  Copy your **Client ID**.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd md-editor-pwa
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory and add your Google Client ID:
    ```bash
    VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
    # Optional: VITE_GOOGLE_API_KEY=YOUR_API_KEY_HERE 
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

-   **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
-   **Language**: TypeScript
-   **Styling**: Vanilla CSS (CSS Variables)
-   **Editor**: [CodeMirror](https://uiwjs.github.io/react-codemirror/)
-   **Preview**: [react-markdown](https://github.com/remarkjs/react-markdown)
-   **Auth & Storage**: Google Identity Services SDK + Google Drive REST API
-   **PWA**: vite-plugin-pwa

## License

MIT

## Important Note

This project is completely vibecoded. I've only made this utility since no good options exist without hours of config.
