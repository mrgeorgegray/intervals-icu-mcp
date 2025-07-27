# Intervals.icu MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/overview) server that provides access to the [Intervals.icu](https://intervals.icu/) API. Interact with your training data, activities, events, and wellness information.

[Intervals.icu](https://intervals.icu) is a powerful training platform for cyclists, runners, and other athletes that provides detailed analytics, workout planning, and performance tracking.

## Inspiration

This project was inspired by the excellent Python-based [intervals-mcp-server](https://github.com/mvilanova/intervals-mcp-server) by [@mvilanova](https://github.com/mvilanova) and the [community discussion](https://forum.intervals.icu/t/mcp-server-for-connecting-claude-with-intervals-icu-api/95999) on the Intervals.icu forum. I decided to rewrite it in TypeScript and add different tools to provide an alternative implementation.

## Alternative: ChatGPT Connector

If you prefer not to use MCP, there's also a [ChatGPT connector for Intervals.icu](https://chatgpt.com/g/g-6867cd930e808191a76d6a03cc7765b5-coach-gpt-for-intervals-icu) available that provides similar functionality through ChatGPT's GPTs feature.

## Features

- **Activity Management**: Retrieve and analyze your training activities
- **Event Creation**: Schedule workouts, races, and other events
- **Athlete Profile**: Access your athlete details and statistics
- **Wellness Data**: Get insights into your health and recovery metrics
- **Bulk Operations**: Create and delete multiple events efficiently

## Requirements

- **Node.js** 22.x or higher
- **Claude Desktop** with MCP support
- **Intervals.icu Account** with API access
- **API Key** from Intervals.icu

## Setup

### 1. Install the Package

Clone the repository:

```bash
git clone git@github.com:mrgeorgegray/intervals-icu-mcp
cd intervals-icu-mcp
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Environment Configuration

If you use this with the inspector copy the example environment file and update it with your credentials, else we'll just add env vars to the Claude config later:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual values:

```env
INTERVALS_API_KEY=your_api_key_here
INTERVALS_ATHLETE_ID=your_athlete_id_here
DEBUG=false
```

**Getting your API credentials:**

You get an API key from your intervals settings page (look for "Developer Settings" near the bottom), or [follow details here](https://forum.intervals.icu/t/api-access-to-intervals-icu/609).

### 4. Configure Claude Desktop

Add the MCP server to your Claude Desktop configuration along with the correct paths and env vars:

_NOTE_: make sure you use the full path to your node version in the command key, to get this please run:

```bash
which node
```

```json
{
  "mcpServers": {
    "intervals-icu-mcp": {
      "command": "/path/to/your/node",
      "args": ["/path/to/intervals-icu-mcp/dist/index.js"],
      "env": {
        "INTERVALS_API_KEY": "your_api_key_here",
        "INTERVALS_ATHLETE_ID": "your_athlete_id_here"
      }
    }
  }
}
```

## Using with Claude

Once configured, Claude can access the following tools:

### Activity Tools

- **`getActivities`** - Retrieve a list of your training activities
  - Filter by date range, limit results, include/exclude unnamed activities
  - Returns formatted activity summaries with key metrics

- **`getActivityDetails`** - Get detailed information about a specific activity
  - Provides comprehensive data including power, heart rate, GPS data
  - Useful for analyzing performance and training effectiveness

### Event Management

- **`createEvent`** - Schedule a new training event or workout
  - Supports all Intervals.icu activity types (Ride, Run, Swim, etc.)
  - Configure event categories, descriptions, and scheduling

- **`createBulkEvents`** - Create multiple events at once
  - Efficient for setting up training blocks or recurring workouts

- **`deleteEvent`** - Remove a specific event from your calendar

- **`deleteBulkEvents`** - Remove multiple events efficiently

### Profile and Wellness

- **`getAthleteDetails`** - Access your athlete profile information
  - View statistics, achievements, and account details

- **`getWellnessData`** - Retrieve health and recovery metrics
  - Includes sleep, stress, fatigue, and other wellness indicators

### Event Information

- **`getEvents`** - List scheduled events and workouts
  - Filter by date range and event types

- **`getEventDetails`** - Get detailed information about a specific event

## Development

### Available Commands

```bash
# Build the project
npm run build

# Start the server in development mode
npm run dev

# Run the MCP inspector for debugging
npm run inspector

# Generate TypeScript client from OpenAPI spec
npm run generate-client

# Linting and formatting
npm run lint
npm run lint:fix
npm run prettier:fix
```

### Project Structure

```
src/
├── client/          # Generated API client
├── tools/           # MCP tool implementations
├── utils/           # Utility functions
└── index.ts         # Main server entry point
```

### API Client Generation

The project uses [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) to generate a TypeScript client from the Intervals.icu OpenAPI specification:

```bash
npm run generate-client
```

This generates the client in `src/client/generated/` based on the `openapi-spec.json` file. The entire API is currently available, but only certain tools have been added so far.

### Debugging

Enable debug mode by setting `DEBUG=true` in your environment variables. This will provide detailed logging of server operations.

Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) for testing and debugging:

```bash
npm run inspector
```

## Troubleshooting

### Common Issues

1. **"INTERVALS_ATHLETE_ID environment variable is not set"**
   - Ensure your `.env` file contains the correct athlete ID
   - Verify the athlete ID in your Intervals.icu profile

2. **API authentication errors**
   - Check that your API key is valid and has the necessary permissions
   - Ensure the API key is correctly set in your environment variables

3. **Build errors**
   - Make sure you're using Node.js 22.x or higher
   - Run `npm install` to ensure all dependencies are installed

## License

This project is licensed under the GNU General Public License v3.0.
