# ERIMTECH AI

ERIMTECH AI is a futuristic, AI-powered web application built with Next.js and Firebase. It offers a suite of advanced AI tools including a chat assistant, code generation/explanation, image analysis, audio transcription, video summarization, and developer API access.

## Project Goals

- To create a production-ready, frontend-focused AI application.
- To leverage Firebase for backend services (Auth, Firestore, Storage).
- To integrate with powerful AI APIs like Google Gemini Pro or OpenAI GPT-4.
- To provide a stunning, futuristic user experience.
- To offer developer-friendly API access for extending AI capabilities.
- To include a comprehensive admin panel for platform management.

## Core Features

- **Futuristic Landing Page**: A visually impressive introduction to ERIMTECH AI.
- **AI Chat Assistant**: Interactive chat with capabilities like URL content analysis.
- **Code Generation & Explanation**: AI-powered tools for developers.
- **Image Analysis**: Understand and describe images using AI.
- **Audio Transcription**: Convert speech to text.
- **Video Summarization**: Get concise summaries of video content.
- **User Authentication**: Secure login using Firebase (Google, Email/Password, Anonymous).
- **Developer API Access**: Allow users to integrate ERIMTECH AI into their own projects.
- **Admin Panel**: Manage users, permissions, content, and platform settings.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, ShadCN/UI
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **AI Services**: Google Gemini Pro (via Genkit) / OpenAI GPT-4 (adaptable)
- **Deployment**: Vercel / Firebase Hosting (recommended)

## Firebase Setup Guide

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click "Add project" and follow the setup instructions.

2.  **Register Your Web App**:
    *   In your Firebase project, go to Project Overview and click the Web icon (`</>`) to add a web app.
    *   Give your app a nickname (e.g., "ERIMTECH AI Web").
    *   Firebase Hosting setup is optional at this stage but recommended for deployment.
    *   Copy the Firebase configuration object.

3.  **Store Firebase Config**:
    *   Create a `.env.local` file in the root of your project.
    *   Add your Firebase configuration variables:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
        NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID" # Optional
        ```
    *   Ensure `.env.local` is in your `.gitignore` file.

4.  **Enable Firebase Services**:
    *   **Authentication**:
        *   In the Firebase Console, go to Authentication > Sign-in method.
        *   Enable desired providers (e.g., Google, Email/Password, Anonymous).
    *   **Firestore**:
        *   Go to Firestore Database > Create database.
        *   Start in **production mode**. Choose your server location.
        *   Update Firestore security rules (see "Security Rules" section below).
    *   **Storage**:
        *   Go to Storage > Get started.
        *   Follow the prompts to set up Cloud Storage.
        *   Update Storage security rules (see "Security Rules" section below).
    *   **Cloud Messaging (FCM)** (Optional for Push Notifications):
        *   If you plan to use FCM, ensure it's enabled. No specific console setup is usually needed beyond adding the SDK if you use push notifications.

5.  **Initialize Firebase in Your App**:
    *   Create a Firebase initialization file (e.g., `src/lib/firebase/index.ts` - this project structure might vary).
        ```typescript
        // src/lib/firebase/index.ts (example path)
        import { initializeApp, getApps, getApp } from 'firebase/app';
        import { getAuth } from 'firebase/auth';
        import { getFirestore } from 'firebase/firestore';
        import { getStorage } from 'firebase/storage';
        // import { getMessaging } from 'firebase/messaging'; // If using FCM

        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
        };

        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);
        // const messaging = getMessaging(app); // If using FCM

        export { app, auth, db, storage /*, messaging */ };
        ```
    *   **Note**: The current project uses a simplified Firebase setup for placeholder auth. You'll need to integrate this fully.

## Security Rules (Firestore & Storage)

It's crucial to set up proper security rules for Firestore and Storage to protect user data.

**Firestore Example Rules (`firestore.rules`):**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Users can only read/write their own chat history
    match /chats/{userId}/{chatId} {
       allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // API Keys: Users can read their own, admins can manage all
    match /apiKeys/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId; // Or specific logic
      // Admin access for list/write would need custom claims
      // allow list, write: if request.auth != null && request.auth.token.admin == true; 
    }
    // Admin-only collections (example for feature toggles)
    match /featureToggles/{featureId} {
      allow read: if request.auth != null; // Or specific user roles
      allow write: if request.auth != null && request.auth.token.admin == true; // Requires admin custom claim
    }
    // Add more rules for other collections (e.g., media metadata, admin logs)
  }
}
```

**Storage Example Rules (`storage.rules`):**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own folder, max 10MB, specific types
    match /userUploads/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024 // Max 10MB
                   && request.resource.contentType.matches('image/.*|audio/.*|video/.*');
    }
    // Public assets (e.g., logos)
    match /public/{allPaths=**} {
      allow read;
    }
  }
}
```
*Deploy these rules via the Firebase Console or Firebase CLI.*

## Connecting AI APIs (Genkit with Google Gemini)

This project is scaffolded to use Google Genkit for AI flow management, primarily with Google Gemini.

1.  **Set up Google Cloud Project & Enable APIs**:
    *   Ensure you have a Google Cloud Project.
    *   Enable the "Vertex AI API" (which includes Gemini) or "Generative Language API" (for older Gemini models if not using Vertex).
    *   Create API keys or set up service account credentials as needed for authentication.
    *   Refer to [Genkit Google AI Plugin documentation](https://genkit.dev/docs/plugins/google-ai) for detailed setup.

2.  **Environment Variables for Genkit**:
    *   Genkit often uses Application Default Credentials (ADC) if running in a Google Cloud environment.
    *   For local development, you might need to set `GOOGLE_APPLICATION_CREDENTIALS` to the path of your service account key JSON file, or use `gcloud auth application-default login`.
    *   If using a specific API key for Gemini (e.g. via MakerSuite/Google AI Studio for `gemini-pro` not via Vertex), set `GOOGLE_GENAI_API_KEY`:
        ```env
        GOOGLE_GENAI_API_KEY="YOUR_GEMINI_API_KEY"
        ```
    * The project's `src/ai/genkit.ts` configures Genkit with the `googleAI()` plugin.

3.  **AI Flows**:
    *   The AI functionalities (chat, code explanation, etc.) are implemented as Genkit flows in `src/ai/flows/`.
    *   These flows define the prompts and interactions with the AI model.
    *   Example: `src/ai/flows/generate-ai-chat-response.ts` uses `ai.defineFlow` and `ai.definePrompt`.

**To Use OpenAI GPT-4 Instead**:

1.  **Install OpenAI Plugin**:
    ```bash
    npm install @genkit-ai/openai
    ```
2.  **Update `src/ai/genkit.ts`**:
    ```typescript
    // src/ai/genkit.ts
    import {genkit} from 'genkit';
    // import {googleAI} from '@genkit-ai/googleai'; // Comment out or remove
    import {openai} from '@genkit-ai/openai'; // Add this

    export const ai = genkit({
      plugins: [
        // googleAI(), // Comment out or remove
        openai({apiKey: process.env.OPENAI_API_KEY}), // Add this
      ],
      // model: 'googleai/gemini-2.0-flash', // Change this
      model: 'openai/gpt-4', // Or 'openai/gpt-3.5-turbo', etc.
      // ... other config
    });
    ```
3.  **Set OpenAI API Key**:
    Add your OpenAI API key to `.env.local`:
    ```env
    OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```
4.  **Adapt Prompts/Flows (If Necessary)**:
    *   While Genkit aims for model-agnostic flows, some prompt engineering might be needed for optimal performance with different models.
    *   Review the prompts in `src/ai/flows/` if you switch models.

## Developer Usage Guide (API)

The Developer API allows programmatic access to ERIMTECH AI features.

1.  **Authentication**:
    *   Users can generate an API key from the `/developer` page (once logged in).
    *   API requests must include an `Authorization` header with a Bearer token:
        `Authorization: Bearer YOUR_API_KEY`

2.  **Endpoints (Fictional - to be implemented)**:
    *   `POST /api/v1/chat`:
        *   Body: `{ "prompt": "Your text prompt", "url": "optional_url_for_context" }`
        *   Returns: `{ "response": "AI generated text" }`
    *   `POST /api/v1/code/generate`:
        *   Body: `{ "description": "Description of code to generate", "language": "python" }`
        *   Returns: `{ "code": "Generated code snippet", "language": "python" }`
    *   `POST /api/v1/code/explain`:
        *   Body: `{ "code": "Your code snippet", "language": "javascript" }`
        *   Returns: `{ "explanation": "Explanation of the code" }`
    *   `POST /api/v1/image/analyze`: (Requires file upload or URL)
        *   Body (form-data): `image: (file)` OR Body (JSON): `{ "imageUrl": "..." }`
        *   Returns: `{ "analysisResult": { "description": "..." } }`
    *   _More endpoints for other features like audio transcription, video summarization._

3.  **Rate Limits**:
    *   API usage is rate-limited based on the user's plan (e.g., Free, Innovator, Visionary).
    *   Exceeding limits will result in a `429 Too Many Requests` error.
    *   Current limits are displayed on the `/developer` page.

4.  **Code Samples**:
    *   JavaScript and Python examples are provided on the `/developer` page to help you get started.

## Admin Usage Instructions

The Admin Panel (`/admin`) is protected and accessible only to users with admin privileges (this requires setting up custom claims in Firebase Authentication).

*   **Dashboard**: Overview of platform statistics (users, API usage, etc.).
*   **User Management**:
    *   View list of users.
    *   Search/filter users.
    *   Change user roles (e.g., make user an admin - requires backend logic for custom claims).
    *   Suspend or ban users.
*   **Media Review**:
    *   View and moderate user-uploaded content (images, audio, video).
    *   Approve or reject media.
*   **API Usage Logs**:
    *   Monitor API requests, view user activity, and identify potential abuse.
*   **Feature Toggles**:
    *   Enable or disable specific platform features globally (e.g., disable new sign-ups, turn off a beta feature).

**Setting up Admin Users**:
This typically involves:
1.  A Firebase Function (or other backend process) that can set custom claims on a user's auth token. For example, `admin: true`.
2.  Frontend logic in `useAuth` or similar to check for this custom claim.
3.  Protecting the `/admin` route and admin-specific API actions based on this claim.

## Local Development

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd erimtech-ai 
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    *   Copy `.env.example` to `.env.local`.
    *   Fill in your Firebase configuration and AI API keys.
4.  **Run Genkit development server (for AI flows)**:
    This command starts the Genkit developer UI, which allows you to test and inspect your AI flows.
    ```bash
    npm run genkit:dev
    # or for auto-reloading on changes
    npm run genkit:watch
    ```
    Access the Genkit UI typically at `http://localhost:4000`.
5.  **Run the Next.js development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002` (or as configured).

## Deployment

**Using Vercel (Recommended for Next.js):**

1.  Push your code to a Git provider (GitHub, GitLab, Bitbucket).
2.  Sign up or log in to [Vercel](https://vercel.com).
3.  Create a new project and import your Git repository.
4.  Configure Environment Variables in Vercel project settings (for Firebase keys, AI API keys, etc.).
5.  Vercel will automatically build and deploy your app. Custom domains can be configured.

**Using Firebase Hosting:**

1.  **Install Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login to Firebase**:
    ```bash
    firebase login
    ```
3.  **Initialize Firebase Hosting**:
    ```bash
    firebase init hosting
    ```
    *   Select your Firebase project.
    *   Set your public directory to `out` (if using static export) or configure rewrites for Next.js SSR/ISR. For Next.js dynamic features, you'll typically need to integrate with Cloud Functions or Cloud Run. Vercel handles this more seamlessly for Next.js.
    *   Configure as a single-page app: Yes (if you're managing routing client-side heavily, otherwise No and set up rewrites).

4.  **Build your Next.js app**:
    ```bash
    npm run build
    ```
    (This might produce a `.next` folder for dynamic apps or an `out` folder for static exports.)

5.  **Deploy to Firebase Hosting**:
    ```bash
    firebase deploy --only hosting
    ```

**Note on Next.js Dynamic Features with Firebase Hosting**:
For full Next.js features like API Routes (Server Actions in App Router), SSR, and ISR, deploying to Firebase Hosting often requires setting up Firebase Cloud Functions to handle Next.js server-side rendering. Vercel is generally more straightforward for deploying Next.js applications with all features enabled. If you choose Firebase Hosting, consult the Firebase documentation for "Hosting Next.js apps".

## Contribution

Details on how to contribute to the project (e.g., coding standards, pull request process) would go here if it were an open-source project.

---

This README provides a comprehensive overview. Remember to replace placeholder values and implement the actual Firebase and AI API integrations.
