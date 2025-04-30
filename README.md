# DrugCheck

![DrugCheck Logo](public/logo.png)

## Comprehensive Health Management System

DrugCheck is a powerful web application designed to help users manage their medications, identify potential drug interactions, generate emergency medical IDs, find cost-effective medication alternatives, and receive AI-powered health insights.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Technology Stack](#technology-stack)
- [Key Components](#key-components)
- [Privacy & Security](#privacy--security)
- [Contributing](#contributing)
- [License](#license)

## Features

### 🔍 Medication Interaction Checker
- Search and add multiple medications to check for potential interactions
- View detailed interaction analysis with severity ratings (severe, moderate, minor)
- Generate and download comprehensive PDF reports
- Save interaction history for future reference

### 🏥 Universal Health ID
- Create QR code-based medical IDs containing critical health information
- AI analysis of your health data with personalized insights and recommendations
- Works completely offline - all data embedded in QR code
- Healthcare providers can scan the QR code to access vital health information in emergencies
- Download and share QR codes for emergency use

### 💊 Medicine Alternative Finder
- Search for lower-cost alternatives to expensive medications
- Compare prices and effectiveness of different medication options
- Make informed decisions about your medication choices

### 💬 Mental Health Support
- Access a mental health chatbot specifically focused on medication effects
- Document mental health concerns related to your medications
- Receive contextualized support based on your medication profile

### 📊 Health Insights Generator
- Receive personalized health insights based on your health profile
- Get recommendations for health monitoring based on your conditions
- Identify potential health risks related to your specific situation

## Demo

Visit our demo site: [https://drugcheck-demo.vercel.app](https://drugcheck-demo.vercel.app)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/drugcheck.git
cd drugcheck
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Checking Drug Interactions

1. Navigate to the "Check Interactions" page
2. Search for medications using the search bar
3. Add multiple medications to your list
4. View interaction results and severity levels
5. Generate a detailed PDF report if needed

### Creating a Health ID

1. Navigate to the "Health ID" page
2. Enter your personal and medical information
3. Click "Generate Health ID with AI"
4. View, download, or share the QR code
5. Explore AI insights and recommendations

### Finding Medication Alternatives

1. Navigate to the "Med Alternatives" page
2. Search for your current medication
3. View available alternatives and cost comparisons
4. Compare effectiveness and side effect profiles

## Technology Stack

- **Frontend**: React.js with TypeScript
- **State Management**: React Context API
- **UI Animation**: Framer Motion
- **Styling**: CSS with responsive design
- **QR Code Generation**: qrcode.react
- **PDF Generation**: Client-side HTML-to-PDF
- **Data Storage**: LocalStorage for persistence

## Key Components

- **DrugContext**: Central state management for the application
- **InteractionChecker**: Core medication interaction analysis
- **UniversalHealthID**: QR code generation with AI analysis
- **MedicineAlternativeFinder**: Alternative medication search
- **MentalHealthChatbot**: Medication-focused mental health support
- **HealthInsightGenerator**: Personalized health analysis

## Privacy & Security

DrugCheck prioritizes user privacy:

- **Local Storage Only**: All health data is stored locally on your device
- **No Server Storage**: Your data is never sent to external servers without your explicit action
- **Client-Side Processing**: All AI analysis happens directly in your browser
- **User Control**: You decide when and how to share your health information

## Contributing

We welcome contributions to DrugCheck! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or support, please [open an issue](https://github.com/yourusername/drugcheck/issues) on our GitHub repository.

*DrugCheck is not a substitute for professional medical advice. Always consult with a healthcare provider before making decisions about your health.* 