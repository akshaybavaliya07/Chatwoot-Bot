this is our site link:  
its related to call center 
visit the site and analyze the our product info
___________________________
options for user or conversation start(write better message for this option selection)
    Product Information
    Support Related
    Demo


for Product (visit callhippo.cin/features  footer)
   1 call center solution
   2 pbx system
   3 voice broadcasting
   4 sms broadcasting
   5 softswitch

on option select 
i will show some info about that prudct
and link related to that product in my site


if user dont add spepcified choice 
then ask user to select valid choice 
and can we exit to this option section ?

_____________________

if types text like contact
then replies contact details 
 mail
 mobile
 website
_____________________

## Chatwoot Bot – Detailed Code Execution Flow Documentation

### Overview
This bot automates Chatwoot conversations by providing interactive product information, support options, and demo booking. The system uses a state machine to manage conversation flow and responds to user button selections or text inputs.

**Architecture**: Express Server → Webhook Controller → Bot Service → State Management → Chatwoot API

---

### 1. Server Initialization (`server.js`)

**Lines 2-6**: Module imports and environment setup
- Imports Express framework, dotenv for environment variables, and webhook routes
- Loads `.env` file to read configuration (PORT, ACCOUNT_ID, CHATWOOT_TOKEN)

**Lines 8-9**: Express app and port configuration
- Creates Express application instance
- Reads PORT from environment or defaults to 4000

**Lines 11-12**: Middleware setup
- Configures JSON body parser with 5MB limit for incoming webhook payloads
- Enables URL-encoded form data parsing

**Line 14**: Route mounting
- Mounts `/webhook` route handler from `routes/webhook.routes.js`

**Lines 16-18**: Health check endpoint
- GET `/` returns simple status message for server health verification

**Lines 20-26**: Server startup
- Starts HTTP server on configured PORT
- Includes error handling: logs error and exits if port binding fails
- Logs success message when server is ready

---

### 2. Webhook Route Handler (`routes/webhook.routes.js`)

**Line 6**: Route definition
- POST `/webhook` endpoint delegates to `handleWebhook` function in controller
- This is the entry point for all Chatwoot webhook events

---

### 3. Webhook Controller (`controllers/webhook.controller.js`)

**Line 5**: Event type constants
- Defines set of valid message events: `message_created` and `message_updated`

**Lines 7-9**: Immediate acknowledgement
- Sends HTTP 200 response immediately to prevent Chatwoot from retrying
- This is critical because Chatwoot will retry if no response is received quickly

**Lines 11-18**: Payload extraction
- Destructures webhook payload to extract:
  - `event`: Type of webhook event (conversation_created, message_created, etc.)
  - `message_type`: Direction of message (incoming, outgoing, template)
  - `content_attributes`: Contains submitted_values for button selections
  - `conversation`: Conversation object with ID
  - `content`: Message text content
  - `id`: Message ID

**Lines 20-30**: Logging and debugging
- Extracts `submitted_values` array from content_attributes
- Logs comprehensive webhook information including:
  - Event type and message type
  - Content and message ID
  - Whether submitted values exist (button selections)
  - Conversation ID

**Lines 32-35**: New conversation handling
- Detects `conversation_created` event
- Automatically sends welcome message with main menu buttons
- Uses `MAIN_MENU` from menu definitions

**Line 37**: Event filtering
- Only processes `message_created` or `message_updated` events
- Ignores other event types (webwidget_triggered, etc.)

**Lines 39-42**: User message detection
- Determines if message is from user:
  - `message_type === "incoming"`: Direct text message from user
  - `hasSubmittedValue`: Button selection from interactive message
- Filters out bot's own outgoing messages and system templates

**Line 44**: Bot processing delegation
- Passes entire webhook body to `processBotMessage` for handling

---

### 4. Bot Service - Input Processing (`services/bot.service.js`)

**Lines 9-18**: User input extraction (`extractUserInput` function)
- Handles two input types:
  1. Button selections: Extracts from `content_attributes.submitted_values[0]`
     - Checks both `value` and `title` fields from submitted button
  2. Text messages: Uses `body.content` directly
- Returns both raw and normalized (lowercase) versions of input
- This ensures button clicks and typed text are handled uniformly

**Lines 20-35**: Button matching (`matchButtonChoice` function)
- Matches user input against button definitions
- Compares against both:
  - Button `payload` or `value` (e.g., "1", "2")
  - Button `title` or `label` (e.g., "Explore Products")
- Returns the matched button's payload/value for routing
- Enables users to click buttons OR type button text/number

**Lines 37-47**: Conversation ID resolution
- Extracts conversation ID from multiple possible locations:
  - `body.conversation.id` (standard location)
  - `body.conversation_id` (alternative format)
  - `body.conversationId` (camelCase variant)
  - `body.additional_attributes.conversation_id` (nested location)
- Logs warning and exits if conversation ID is missing
- This ensures state management works correctly

**Lines 49-54**: State retrieval and logging
- Gets conversation-specific state using `getState(conversationId)`
- Logs current state and raw message for debugging
- State persists across multiple webhook calls for same conversation

---

### 5. Bot Service - Global Keywords (`services/bot.service.js`)

**Lines 55-60**: Exit/Reset handler
- Detects "exit" keyword (case-insensitive)
- Resets conversation state to "main" using `resetState()`
- Sends main menu again to restart conversation flow
- Works from any state (main or products)

**Lines 62-69**: Contact keyword handler
- Detects "contact" keyword (exact match, case-insensitive)
- Sends contact information:
  - Email: support@driansh.com
  - Phone: +91-7028764776
  - Website: https://www.driansh.com
- Works from any state, doesn't change conversation state

---

### 6. Bot Service - Main Menu Flow (`services/bot.service.js`)

**Line 72**: State check
- Executes when `state.step === "main"`

**Line 73**: Choice matching
- Uses `matchButtonChoice` to match user input against main menu buttons
- Falls back to raw message if no button match found
- Logs the matched choice for debugging

**Lines 77-82**: Option 1 - Explore Products
- Detects choice "1" or "Explore Products"
- Updates state: `state.step = "products"`
- Logs state transition
- Sends `PRODUCTS_MENU` with product selection buttons
- Returns to prevent further processing

**Lines 84-87**: Option 2 - Support
- Detects choice "2" or "Talk to Support"
- Sends support acknowledgement message
- Returns without changing state

**Lines 89-92**: Option 3 - Demo
- Detects choice "3" or "Book a Demo"
- Sends demo booking link
- Returns without changing state

**Lines 94-95**: Default/Invalid choice
- Handles unrecognized input in main menu
- Re-sends main menu to guide user
- Returns to prevent further processing

---

### 7. Bot Service - Products Flow (`services/bot.service.js`)

**Line 99**: State check
- Executes when `state.step === "products"`

**Lines 100-102**: Product key extraction
- Matches user input against product menu buttons
- Falls back to raw message if no button match
- Uses matched value to look up product in `PRODUCT_INFO` catalog

**Line 104**: Logging
- Logs the product choice for debugging

**Lines 106-113**: Invalid product selection
- If product key doesn't exist in `PRODUCT_INFO`
- Sends error message asking for valid selection
- Re-sends product menu buttons
- Returns without changing state

**Lines 115-118**: Valid product selection
- Constructs product information message:
  - Product name (bold formatted)
  - Product description
  - Product link URL
  - Helper text: "Type *menu* anytime to see the options again"
- Sends message via Chatwoot API

**Lines 120-122**: State persistence
- Keeps conversation in "products" state
- Does NOT automatically return to main menu
- User stays in products context until they navigate away
- Logs state for debugging

---

### 8. State Management (`state/conversation.state.js`)

**Line 1**: In-memory storage
- Uses JavaScript `Map` to store conversation states
- Key: normalized conversation ID (string)
- Value: state object with `step` property

**Lines 3-6**: ID normalization
- Converts conversation ID to string for consistent key matching
- Handles numeric IDs, string IDs, and null/undefined safely
- Prevents state lookup failures due to type mismatches

**Lines 8-16**: State retrieval (`getState` function)
- Normalizes conversation ID
- Returns default state `{ step: "main" }` if ID is missing
- Lazy initialization: Creates state entry if it doesn't exist
- Always initializes new conversations with `step: "main"`

**Lines 18-22**: State reset (`resetState` function)
- Resets conversation state back to `{ step: "main" }`
- Used when user types "exit" keyword
- Normalizes ID before resetting

---

### 9. Menu Definitions (`menus/main.menu.js`)

**Lines 1-8**: Main menu configuration
- Welcome message text
- Three button options:
  1. "Explore Products" → payload "1"
  2. "Talk to Support" → payload "2"
  3. "Book a Demo" → payload "3"

**Lines 10-19**: Products menu configuration
- Prompt text for product selection
- Five product buttons:
  1. "Call Center Solution" → payload "1"
  2. "PBX System" → payload "2"
  3. "Voice Broadcasting" → payload "3"
  4. "SMS Broadcasting" → payload "4"
  5. "Softswitch" → payload "5"

**Lines 21-47**: Product information catalog
- Maps product keys ("1" through "5") to product details
- Each product contains:
  - `name`: Display name
  - `desc`: Detailed description
  - `link`: URL to product page on website

---

### 10. Chatwoot API Service (`services/chatwoot.service.js`)

**Lines 3-4**: API credentials
- Hardcoded ACCOUNT_ID and CHATWOOT_TOKEN
- Note: In production, these should come from environment variables

**Lines 6-15**: Input validation
- Validates `conversationId` exists, logs warning if missing
- Validates `content` exists, logs warning if missing
- Early return prevents API calls with invalid data

**Lines 17-20**: Base payload construction
- Sets message `content` (text to display)
- Sets `message_type: "outgoing"` (from bot to user)

**Lines 22-32**: Interactive button setup
- If buttons are provided:
  - Sets `content_type: "input_select"` (Chatwoot interactive message type)
  - Maps button array to Chatwoot format:
    - Extracts `title` from button (display text)
    - Extracts `value` from `payload` or `value` field
    - Creates `items` array with `{ title, value }` objects
  - This format enables clickable dropdown/select in Chatwoot widget

**Lines 34-42**: API request
- POSTs to Chatwoot REST API endpoint:
  - URL: `/api/v1/accounts/{ACCOUNT_ID}/conversations/{conversationId}/messages`
  - Headers: `api_access_token` for authentication
- Error handling: Logs API errors but doesn't throw (prevents webhook failures)

---

### Complete Execution Flow Example

**Scenario: User clicks "Explore Products" button**

1. **Chatwoot sends webhook** → `POST /webhook`
   - Event: `message_updated`
   - `message_type: "outgoing"` (bot's message was updated)
   - `content_attributes.submitted_values: [{ title: "Explore Products", value: "1" }]`

2. **Controller receives** (`controllers/webhook.controller.js:7-44`)
   - Sends 200 OK immediately (line 9)
   - Extracts event, message type, submitted values (lines 11-20)
   - Logs webhook details (lines 22-30)
   - Detects `hasSubmittedValue = true` (line 39)
   - Calls `processBotMessage(req.body)` (line 44)

3. **Bot service processes** (`services/bot.service.js:37-82`)
   - Extracts conversation ID: `33` (lines 38-42)
   - Extracts user input: `raw: "1"`, `normalized: "1"` (line 49, via `extractUserInput`)
   - Gets state: `{ step: "main" }` (line 50)
   - Matches button choice: "1" → "1" (line 73, via `matchButtonChoice`)
   - Detects `state.step === "main"` (line 72)
   - Detects `choice === "1"` (line 77)
   - Updates state: `state.step = "products"` (line 78)
   - Calls `sendMessage(33, PRODUCTS_MENU.text, PRODUCTS_MENU.buttons)` (line 80)

4. **Chatwoot service sends** (`services/chatwoot.service.js:6-42`)
   - Validates conversation ID and content (lines 7-14)
   - Builds payload with content and buttons (lines 17-32)
   - POSTs to Chatwoot API (lines 34-42)

5. **User sees product menu** in Chatwoot widget with 5 product options

**Scenario: User selects "Call Center Solution"**

1. **Chatwoot sends webhook** with `submitted_values: [{ title: "Call Center Solution", value: "1" }]`

2. **Controller** → `processBotMessage` (same as above)

3. **Bot service processes** (`services/bot.service.js:98-122`)
   - State is now `{ step: "products" }`
   - Extracts input: `raw: "1"` (from submitted value)
   - Matches product button: "1" → "1" (line 101)
   - Looks up product: `PRODUCT_INFO["1"]` (line 102)
   - Finds product details (lines 22-26 in `main.menu.js`)
   - Sends product info message (lines 115-118)
   - Stays in "products" state (line 121)

4. **User sees** product description with link and helper text

---

### Key Design Decisions

1. **Immediate webhook acknowledgement**: Prevents Chatwoot retries and improves reliability
2. **State persistence**: Maintains conversation context across multiple webhook calls
3. **Flexible input matching**: Handles both button clicks and typed text
4. **Interactive messages**: Uses `input_select` for better UX in Chatwoot widget
5. **No auto-navigation**: Product selection doesn't auto-return to main menu, giving user control
6. **Global keywords**: "exit" and "contact" work from any state for better UX
7. **Error handling**: Validates inputs and logs warnings without crashing

---

### Environment Variables Required

- `PORT`: Server port (defaults to 4000)
- `ACCOUNT_ID`: Chatwoot account ID (currently hardcoded)
- `CHATWOOT_TOKEN`: Chatwoot API access token (currently hardcoded)

**Note**: Move credentials to `.env` file for production security.

______________________

