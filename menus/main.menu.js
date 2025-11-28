export const MAIN_MENU = {
  text: "👋 Welcome to Driansh Softtech Pvt Ltd. Where should we start?",
  buttons: [
    { title: "Explore Products", payload: "1" },
    { title: "Talk to Support", payload: "2" },
    { title: "Book a Demo", payload: "3" }
  ]
};

export const PRODUCTS_MENU = {
  text: "Great! Pick the platform you want to learn about:",
  buttons: [
    { title: "Call Center Solution", payload: "1" },
    { title: "PBX System", payload: "2" },
    { title: "Voice Broadcasting", payload: "3" },
    { title: "SMS Broadcasting", payload: "4" },
    { title: "Softswitch", payload: "5" }
  ]
};

export const PRODUCT_INFO = {
  "1": {
    name: "Call Center Solution",
    desc: "Intelligent inbound/outbound routing, live dashboards, QA recordings, and CRM connectors built for high-volume teams.",
    link: "https://www.driansh.com/call-center-solution"
  },
  "2": {
    name: "PBX System",
    desc: "Multi-tenant IP PBX with IVR, voicemail-to-mail, and role-based administration for distributed offices.",
    link: "https://www.driansh.com/multi-tenant-ip-pbx-solution"
  },
  "3": {
    name: "Voice Broadcasting",
    desc: "Schedule or trigger large scale voice campaigns with AI text-to-speech, retries, and actionable analytics.",
    link: "https://www.driansh.com/voice-broadcasting-solution"
  },
  "4": {
    name: "SMS Broadcasting",
    desc: "Transactional and promotional SMS flows with templates, opt-out compliance, and delivery tracking.",
    link: "https://www.driansh.com/services/webrtc-development-service"
  },
  "5": {
    name: "Softswitch",
    desc: "Carrier-grade Class 4/5 softswitch for VoIP operators with billing, fraud controls, and live monitoring.",
    link: "https://www.driansh.com/services/freeswitch-devlopment-service"
  }
};
