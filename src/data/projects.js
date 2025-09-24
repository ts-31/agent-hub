export const STATIC_PROJECTS = [
  {
    id: 1,
    name: "Project A",
    chats: [
      {
        id: 1,
        role: "assistant",
        text: "Hello — I'm Agent for Project A. How can I help?",
      },
      { id: 2, role: "user", text: "Give me a one-line summary of Project A." },
      {
        id: 3,
        role: "assistant",
        text: "Project A is a demo to showcase Chat-like UI with Next.js and Tailwind.",
      },
    ],
  },
  {
    id: 2,
    name: "Project B",
    chats: [
      {
        id: 1,
        role: "assistant",
        text: "Agent for Project B here — ready when you are.",
      },
    ],
  },
  {
    id: 3,
    name: "Project C",
    chats: [],
  },
];
