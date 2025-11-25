# **App Name**: Peepos Pro

## Core Features:

- Persistent MySQL Database: Configures MySQL 8.4 with data persistence within the project directory to prevent data loss on rebuild.
- User Authentication: Implements user authentication and session management using Laravel Sanctum.
- Attendance Tracking: Logs user attendance with check-in and check-out times, status, and scan source, viewable in a sortable table.
- Reporting & Analytics: Generates reports on attendance and other metrics based on customizable criteria. Format: PDF/Excel/CSV.
- AI Chat Assistant: Integrates an AI chat panel that can answer administrative questions and perform tasks. The Laravel backend will use the Google Gemini tool to interpret and respond.
- User Management: Enables administrators to manage users (students, teachers, staff) with different roles, statuses, and academic information (levels, grades, sections).
- Notifications: Displays system alerts, such as lateness warnings or emergency events.

## Style Guidelines:

- Primary color: Indigo (#4F46E5), provides a sense of trust, intelligence, and sophistication, aligning well with an educational setting.
- Background color: Light gray (#F9FAFB), ensures content readability and a clean, modern aesthetic.
- Accent color: Sky Blue (#38BDF8), draws attention to key interactive elements, without overwhelming the design. Provides contrast and an impression of competence.
- Body and headline font: 'Inter', a sans-serif font with a modern, neutral aesthetic, is recommended for both headlines and body text.
- Lucide Icons will be used throughout the app, ensuring a consistent and modern visual language.  Icons are related to school administration, messaging and scheduling.
- Dashboard layout provides easy-to-scan KPI metrics in the top part of the dashboard and quick access operations below, so administrators are well-informed without spending more time than necessary. Page widths limited to a reasonable max-width for comfortable readability.
- Subtle transitions, loading animations, and modal animations will be used to provide a fluid and engaging user experience.