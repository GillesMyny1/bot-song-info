# Spotify Currently Playing Song Info

This web application fetches the album art, song name, and song artists of the song currently playing on Spotify and displays it as an animation.

## Features

- **Spotify Authentication**: Users can log in with their Spotify account to fetch tempo data.
- **Scrolling Info**: The animated song name and artist name allows for full viewing with longer text.
- **Responsive Design**: The application is centered on the screen with properly aligned elements.
- **OBS Compatible**: The animated sprite can be pulled into OBS using a Browser source with a few clicks.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- A Spotify Developer account with a registered application to obtain the `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI`.

### Spotify Developer App

   To create your app in Spotify Developer at `https://developer.spotify.com/dashboard`, hit `Create App`, fill in required informatation.
   1. Name the app
   2. Describe the app
   3. Redirect URIs must contain `http://localhost:3001/callback` when running this locally.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/GillesMyny1/bot-song-info.git
   cd bot-song-info

2. **Install Dependencies**

   Navigate to the project directory and install the necessary dependencies:

   ```bash
   npm install

4. **Initial Startup**

   Start the server for the first time by running:

   ```bash
   npm start <CLIENT_ID> <CLIENT_SECRET> <REDIRECT_URI>

5. **Following Startups**

   After you've started the server and the `.env` file was setup, you can start the server by running:

   ```bash
   npm start

5. **Authorize Spotify**

   The application will be available at `http://localhost:3001`. Open this URL in your web browser to interact with the app.

   Authorize the app to fetch your token and begin fetching all of the info of your currently played song.

6. **OBS Connection**

   In OBS, add Browser source, in the `URL` field enter `http://localhost:3001`, in the `Width` and `Height` fields enter a comfortable size (i.e. 800px 600px) and hit `OK`.

   You can then resize the Browser source holding `Alt` on your keyboard to ensure only the animated sprite is visible.

## Customization

### Changing the color of the text background

In `styles.css` please change the respective commented line in `#song-info` to your desired color name, number, or hex code.