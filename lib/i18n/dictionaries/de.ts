import type { Dictionary } from "../types";

const de: Dictionary = {
  site: {
    name: "Agent Templates",
    phaseBadge: "Phase 1 · Öffentlicher Katalog",
  },
  nav: {
    catalog: "Katalog",
    mcp: "MCP-Server",
    contentRepo: "Content-Repo",
  },
  language: {
    label: "Sprache",
    en: "English",
    de: "Deutsch",
  },
  theme: {
    switchToLight: "Zum hellen Modus wechseln",
    switchToDark: "Zum dunklen Modus wechseln",
  },
  footer: {
    contentFrom: "Inhalte aus",
    phaseNote:
      "Diese Website ist schreibgeschützt; noch keine Konten oder Reviews (Phase 1).",
    websiteRepo: "Website-Repo",
  },
  common: {
    catalog: "Katalog",
    templates: "Vorlagen",
    template: "Vorlage",
    version: "Version",
    updated: "Aktualisiert",
    tags: "Tags",
    inputs: "Eingaben",
    outputs: "Ausgaben",
    metadata: "Metadaten",
    source: "Quelle",
    viewOnGitHub: "Auf GitHub ansehen",
    suggestImprovement: "Verbesserung vorschlagen",
    copy: "Kopieren",
    copied: "Kopiert",
    idLabel: "id",
    noTemplatesMatch: "Keine Vorlagen passen zu den Filtern.",
    allDomains: "Alle Domains",
    allCategories: "Alle Kategorien",
    allAgents: "Alle Agenten",
    allRisk: "Alle Risikostufen",
    allTags: "Alle Tags",
    showingCount: "{shown} von {total} Vorlagen angezeigt",
    generatedAt: "Katalog generiert am",
    categories: "Kategorien",
    auth: "Auth",
    name: "Name",
    type: "Typ",
  },
  risk: {
    suffix: "Risiko",
    low: "niedrig",
    medium: "mittel",
    high: "hoch",
  },
  exampleKind: {
    synthetic: "Beispieldaten",
    realWorld: "Praxisbeispiel",
    unknown: "Beispiel",
  },
  home: {
    title: "Wiederverwendbare Agenten-Instruktionen",
    introBeforeLink: "Diese Website rendert ",
    introAfterLink:
      " zur Build-Zeit: Domains, Kategorien, MCP-Katalog und plattformspezifische Exporte — ohne Vorlagen in diesem Repository zu kopieren.",
    browseCatalog: "Katalog öffnen",
    mcpServers: "MCP-Server",
    countsHeading: "Zähler aus dem Content-Repo",
    countsTemplates: "Vorlagen",
    countsDomains: "Domains",
    countsCategories: "Kategorien",
    countsMcp: "MCP-Katalogeinträge",
    platformsHeading: "Unterstützte Plattformen",
    platformsIntro:
      "Jede Vorlage listet Ziel-Agenten. Der Export passt System-Prompt und Ablauf an für:",
    adaptersNote:
      "Integrationshinweise liegen im Content-Repo unter adapters/",
    domainsHeading: "Domains",
    viewAllCatalog: "Alle im Katalog anzeigen",
  },
  catalog: {
    title: "Vorlagenkatalog",
    intro:
      "Volltextsuche über Titel, Tags und Prompt-Inhalte (zur Build-Zeit indexiert).",
    searchPlaceholder: "Volltextsuche (Titel, Tags, Prompt-Text)…",
    searchLabel: "Vorlagen durchsuchen",
  },
  mcp: {
    title: "MCP-Server-Katalog",
    intro:
      "{count} Einträge aus mcp/catalog.json im Content-Repo (generiert {date}).",
  },
  domain: {
    statsLine: "{templates} Vorlagen in {categories} Kategorien",
    allTemplates: "Alle Vorlagen",
    domainMeta: "Agenten-Vorlagen in der Domain {domain}.",
  },
  template: {
    notFound: "Vorlage nicht gefunden",
    noPromptBlock: "Kein eingeschlossener Prompt-Block gefunden.",
    sections: {
      purpose: "Zweck",
      whenToUse: "Wann nutzen",
      toolStack: "Tool-Stack",
      systemPrompt: "System-Prompt",
      workflow: "Arbeitsablauf",
      definitionOfDone: "Definition of Done",
      security: "Sicherheit",
      pitfalls: "Fallstricke",
      examples: "Beispiele",
    },
    copyPrompt: "Prompt kopieren",
  },
  export: {
    heading: "Export für deine Plattform",
    download: "Herunterladen",
    copyExport: "Export kopieren",
    platformLabel: "Zielplattform",
    descriptions: {
      hermes: "Hermes-Skill (System-Prompt + Ablauf, ohne YAML-Frontmatter)",
      openclaw: "OpenClaw-Skill (vor Produktion verifizieren)",
      "claude-code": "Claude-Code-Projektanweisungen",
      codex: "Codex / Multi-Agent AGENTS.md",
      cursor: "Cursor-Regeldatei (.mdc)",
      generic: "Portabler ROLE/TOOLS/WORKFLOW-Block",
    },
  },
  meta: {
    titleDefault: "Agent Templates",
    titleTemplate: "%s · Agent Templates",
    description:
      "Durchsuchen und exportieren Sie wiederverwendbare KI-Agenten-Vorlagen aus der Datenbank buberlo/agent-templates.",
    ogDescription:
      "Agenten-Prompts für Hermes, OpenClaw, Claude Code, Codex, Cursor und mehr.",
    catalogTitle: "Katalog",
    catalogDescription:
      "Vorlagen nach Domain, Kategorie, Agent, Risiko und Tags filtern.",
    mcpTitle: "MCP-Katalog",
    mcpDescription:
      "MCP-Server aus der agent-templates-Content-Datenbank.",
    ogHomeTitle: "Bibliothek für Agenten-Instruktionen",
    ogHomeSubtitle: "Vorlagen · Domains · MCP-Einträge",
    ogTemplateBrand: "Agent Templates",
  },
};

export default de;