import { useState } from 'react'
import './GuideView.css'

interface GuideItem {
  icon: string
  label: string
  desc: string
  details: string[]
  tips?: string
  route?: string
}

interface GuideSection {
  title: string
  items: GuideItem[]
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: 'Communication',
    items: [
      {
        icon: '\u{1F4AC}',
        label: 'AI Chat',
        desc: 'Chat directly with your AI assistant. Ask questions, give tasks, have conversations.',
        route: '/chat',
        details: [
          'Send messages to your AI and get instant responses',
          'Upload files and documents for your AI to analyze',
          'Use slash commands (/) for quick actions like /status, /report, /summary',
          'Voice input — tap the mic button to dictate messages hands-free',
          'Your AI remembers context from previous conversations',
          'Works on desktop and mobile — same experience everywhere',
        ],
        tips: 'Be specific with your requests. Instead of "help me with marketing," try "draft a LinkedIn post about our new 3PL automation features."',
      },
      {
        icon: '\u{1F4E2}',
        label: 'Team AI Chat',
        desc: 'Collaborate with your full AI team in a shared chat room.',
        route: '/team-chat',
        details: [
          'HOW TO JOIN: Click "Team AI Chat" in the sidebar, choose "I\'m a Human" on the lobby screen, and you are in the AI Team channel',
          'CHANNELS: "AI Team" is the main room where all AIs live. "General" is for broader team discussions. Create new rooms with the + button',
          'SENDING MESSAGES: Type in the box at the bottom and press Enter or tap Send. Use the mic button for voice input',
          'INVITING PEOPLE: Tap the red "Invite to Chat" button in the sidebar to generate a share link. Send that link to anyone you want in the conversation',
          'CREATING A NEW ROOM: Tap the + button in the sidebar, name the room, and add participants. New rooms appear instantly',
          'ONLINE STATUS: Green dots show who is currently active in the chat. AIs show online when their container is running',
          'PIN MESSAGES: Long-press or right-click a message to pin it. Pinned messages appear at the top of the channel for everyone',
          'Each AI has different expertise — Forge (tech/CTO), Between (strategy), Clarity (support), Catalyst (operations), Apex (sales)',
        ],
        tips: 'Start by posting in AI Team — all your AIs will see it. For private conversations with one AI, create a new 1-on-1 room using the + button.',
      },
      {
        icon: '\u{1F4E8}',
        label: 'Agent Mail',
        desc: 'Your AI\'s email inbox. Send and receive emails on behalf of your business.',
        route: '/agent-mail',
        details: [
          'Your AI has its own email address and can send/receive emails',
          'Compose emails with AI assistance — it drafts, you approve',
          'AI reads incoming emails and can summarize or respond',
          'Set up automated responses for common inquiries',
          'All emails are logged and searchable',
          'Keeps your personal inbox clean while AI handles routine communication',
        ],
        tips: 'Have your AI draft follow-up emails after meetings — it remembers the conversation and can personalize each message.',
      },
    ],
  },
  {
    title: 'Workspace',
    items: [
      {
        icon: '\u{1F465}',
        label: 'Live View',
        desc: 'See all active AI agents and what they\'re working on right now.',
        route: '/live',
        details: [
          'Real-time dashboard showing every active AI agent',
          'See what each agent is currently working on',
          'Monitor task progress and completion status',
          'View agent activity history and recent outputs',
          'Identify bottlenecks or idle agents',
          'Great for understanding how your AI team operates behind the scenes',
        ],
        tips: 'Check Live View when you want to know if your AI team is busy or available for a new task.',
      },
      {
        icon: '\u{2328}\u{FE0F}',
        label: 'Console',
        desc: 'Direct terminal access to your AI system. For advanced users.',
        route: '/console',
        details: [
          'Command-line interface to your AI infrastructure',
          'Run system commands and check service status',
          'View logs and debug issues in real-time',
          'Access advanced configuration options',
          'Monitor system resources and performance',
          'Best suited for technical users and administrators',
        ],
        tips: 'If you are not technical, you likely will not need the Console. Your AI handles everything through the chat interface.',
      },
      {
        icon: '\u{1F4C5}',
        label: 'AI Calendar',
        desc: 'Schedule tasks, set reminders, and manage your AI\'s calendar.',
        route: '/calendar',
        details: [
          'Schedule one-time or recurring tasks for your AI',
          'Set reminders that your AI will proactively notify you about',
          'View upcoming deadlines and milestones',
          'AI can auto-schedule tasks based on priority and dependencies',
          'Sync with external calendars (coming soon)',
          'Morning briefings and daily summaries are calendar-driven',
        ],
        tips: 'Set a daily morning briefing — your AI will send you a summary of what happened overnight and what is on deck for today.',
      },
      {
        icon: '\u{1F4CC}',
        label: 'Bookmarks',
        desc: 'Save and organize important links and resources.',
        details: [
          'Bookmark any page, document, or resource for quick access',
          'Organize bookmarks by category or project',
          'Share bookmarks across your team',
          'AI can suggest relevant bookmarks based on your current task',
          'Quick search across all saved resources',
        ],
        tips: 'Bookmark your most-used reports and dashboards for one-click access.',
      },
    ],
  },
  {
    title: 'Data & Intelligence',
    items: [
      {
        icon: '\u{1F9E0}',
        label: 'Memory',
        desc: 'What your AI knows and remembers about your business and preferences.',
        route: '/memory',
        details: [
          'View everything your AI has learned about your business',
          'Business details — your company, industry, products, services',
          'Preferences — how you like reports formatted, communication style',
          'Key contacts — who is who in your organization',
          'Past decisions — what was decided and why',
          'You can edit or delete any memory to keep your AI accurate',
        ],
        tips: 'Review your AI\'s memory periodically. If something is wrong or outdated, correct it — your AI will learn from the correction.',
      },
      {
        icon: '\u{2B50}',
        label: 'Scorecard',
        desc: 'Track AI performance metrics and achievements.',
        route: '/scorecard',
        details: [
          'See how your AI team is performing across key metrics',
          'Response time — how fast your AI responds to requests',
          'Task completion rate — percentage of tasks finished successfully',
          'Customer satisfaction scores from AI interactions',
          'Volume metrics — messages handled, emails sent, calls taken',
          'Trend charts showing improvement over time',
        ],
        tips: 'Use the Scorecard in client meetings to demonstrate AI ROI with real numbers.',
      },
      {
        icon: '\u{1F4D6}',
        label: 'Documents',
        desc: 'Upload, view, and manage documents your AI can reference.',
        route: '/documents',
        details: [
          'Upload PDFs, Word docs, spreadsheets, and more',
          'Your AI reads and understands uploaded documents',
          'Ask questions about your documents in AI Chat',
          'AI can summarize long documents in seconds',
          'Extract key data points and action items from contracts',
          'Organize documents by project or category',
        ],
        tips: 'Upload your rate cards, SOPs, and contracts — then ask your AI to reference them when generating quotes or proposals.',
      },
      {
        icon: '\u{1F4CA}',
        label: 'Data',
        desc: 'Spreadsheets and structured data for analysis and reporting.',
        route: '/data',
        details: [
          'View and manage structured data tables',
          'Import data from CSV, Excel, or other sources',
          'AI can analyze trends, find patterns, and generate insights',
          'Create custom reports from your data',
          'Export data in multiple formats',
          'Connects to your CRM, leads, and pipeline data',
        ],
        tips: 'Upload your sales data and ask your AI to identify your top-performing products, best customers, or seasonal trends.',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        icon: '\u{26A1}',
        label: 'Coordination',
        desc: 'Multi-AI coordination dashboard for complex workflows.',
        route: '/coordination',
        details: [
          'Orchestrate multiple AIs working together on complex tasks',
          'View workflow pipelines and task dependencies',
          'Monitor handoffs between AI specialists',
          'Set up automated multi-step workflows',
          'Track which AI handled which part of a project',
          'Advanced feature for power users managing large AI teams',
        ],
        tips: 'Use Coordination when you have a multi-step project — like an RFP response that needs research, analysis, writing, and review.',
      },
      {
        icon: '\u{1F4CA}',
        label: 'Health',
        desc: 'System health monitoring. Check uptime, performance, and connectivity.',
        route: '/status',
        details: [
          'Real-time system status — green means everything is running',
          'Uptime tracking for all AI services',
          'Performance metrics — response latency, throughput',
          'Connectivity status to external services and APIs',
          'Alert history — past issues and how they were resolved',
          'Useful for troubleshooting if something feels slow',
        ],
        tips: 'If your AI seems slow or unresponsive, check Health first — it will tell you if there is a known issue.',
      },
      {
        icon: '\u{2699}\u{FE0F}',
        label: 'Settings',
        desc: 'Customize your portal experience, theme, and preferences.',
        route: '/settings',
        details: [
          'Set your company name, logo, and branding',
          'Configure notification preferences',
          'Manage quick-fire pill suggestions in chat',
          'Set your preferred language and timezone',
          'Manage API keys and integrations',
          'Control what appears in your sidebar navigation',
        ],
        tips: 'Customize your quick-fire pills in Settings — add the prompts you use most often for one-tap access in AI Chat.',
      },
    ],
  },
]

export function GuideView() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (label: string) => {
    setExpanded(prev => prev === label ? null : label)
  }

  return (
    <div className="guide-view">
      <div className="guide-header">
        <h1 className="guide-title">Portal Guide</h1>
        <p className="guide-subtitle">Tap any feature to learn more about what it does and how to use it</p>
      </div>
      {GUIDE_SECTIONS.map(section => (
        <div key={section.title} className="guide-section">
          <h2 className="guide-section-title">{section.title}</h2>
          <div className="guide-grid">
            {section.items.map(item => (
              <div
                key={item.label}
                className={`guide-card ${expanded === item.label ? 'guide-card-expanded' : ''}`}
                onClick={() => toggle(item.label)}
              >
                <span className="guide-card-icon">{item.icon}</span>
                <div className="guide-card-content">
                  <div className="guide-card-header">
                    <h3 className="guide-card-label">{item.label}</h3>
                    <span className={`guide-card-chevron ${expanded === item.label ? 'guide-card-chevron-open' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                  <p className="guide-card-desc">{item.desc}</p>
                  {expanded === item.label && (
                    <div className="guide-card-details">
                      <ul className="guide-detail-list">
                        {item.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      {item.tips && (
                        <div className="guide-tip">
                          <strong>Tip:</strong> {item.tips}
                        </div>
                      )}
                      {item.route && (
                        <a
                          href={`#${item.route}`}
                          className="guide-go-btn"
                          onClick={e => e.stopPropagation()}
                        >
                          Open {item.label} →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
