import type { ExportTarget } from "@/lib/content/constants";

import type { PackSlug } from "@/lib/content/packs";

type AdditionalInstructionTarget = "windsurf" | "gemini-cli" | "copilot" | "cline" | "kiro";

export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export type Dictionary = {
  site: {
    name: string;
    phaseBadge: string;
  };
  nav: {
    catalog: string;
    mcp: string;
    packs: string;
    contentRepo: string;
  };
  language: {
    label: string;
    en: string;
    de: string;
  };
  theme: {
    switchToLight: string;
    switchToDark: string;
  };
  footer: {
    contentFrom: string;
    phaseNote: string;
    websiteRepo: string;
  };
  common: {
    taskComplete: string;
    taskIncomplete: string;
    skipContent: string;
    navigation: string;
    resetFilters: string;
    catalog: string;
    templates: string;
    template: string;
    version: string;
    updated: string;
    tags: string;
    inputs: string;
    outputs: string;
    metadata: string;
    source: string;
    viewOnGitHub: string;
    suggestImprovement: string;
    copy: string;
    copied: string;
    idLabel: string;
    noTemplatesMatch: string;
    allDomains: string;
    allCategories: string;
    allAgents: string;
    allRisk: string;
    allTags: string;
    showingCount: string;
    generatedAt: string;
    categories: string;
    auth: string;
    name: string;
    type: string;
  };
  platforms: Record<AdditionalInstructionTarget, string> & {
    hermes: string;
    grokbot: string;
    openclaw: string;
    "claude-code": string;
    codex: string;
    cursor: string;
    "generic-mcp-agents": string;
    generic: string;
  };
  risk: {
    suffix: string;
    low: string;
    medium: string;
    high: string;
  };
  exampleKind: {
    synthetic: string;
    realWorld: string;
    unknown: string;
  };
  home: {
    headlineStart: string;
    headlineEnd: string;
    value: string;
    featured: string;
    browseDomains: string;
    importFind: string;
    importFindText: string;
    importExport: string;
    importExportText: string;
    importUse: string;
    importUseText: string;
    title: string;
    introBeforeLink: string;
    introAfterLink: string;
    browseCatalog: string;
    mcpServers: string;
    countsHeading: string;
    countsTemplates: string;
    countsDomains: string;
    countsCategories: string;
    countsMcp: string;
    platformsHeading: string;
    platformsIntro: string;
    adaptersNote: string;
    domainsHeading: string;
    viewAllCatalog: string;
  };
  howItWorks: {
    title: string;
    kicker: string;
    intro: string;
    readGuide: string;
    machineReadable: {
      heading: string;
      llms: string;
      index: string;
      detail: string;
    };
    grokBot: {
      heading: string;
      create: string;
      paste: string;
      connect: string;
      copy: string;
      add: string;
      docs: string;
      publishingHeading: string;
      publishing: string;
      gallery: string;
      guide: string;
    };
    otherAgents: string;
    hermesOpenClaw: string[];
    claudeCode: string[];
    codex: string[];
    cursor: string[];
    generic: string[];
    additionalTargets: Record<AdditionalInstructionTarget, string[]>;
  };
  packs: {
    title: string;
    intro: string;
    browse: string;
    domains: string;
    includedTemplates: string;
    install: string;
    installIntro: string;
    templateCount: string;
    toolCount: string;
    entries: Record<PackSlug, { title: string; description: string }>;
  };
  catalog: {
    empty: string;
    filters: string;
    searchAction: string;
    title: string;
    intro: string;
    searchPlaceholder: string;
    searchLabel: string;
  };
  mcp: {
    title: string;
    intro: string;
  };
  mcpConfig: {
    heading: string;
    client: string;
    editor: string;
    transport: string;
    stdio: string;
    http: string;
    file: string;
    merge: string;
    authUnknown: string;
    placeholders: string;
    copy: string;
  };
  domain: {
    statsLine: string;
    allTemplates: string;
    domainMeta: string;
  };
  template: {
    onPage: string;
    mcpTools: string;
    copyFailed: string;
  notFound: string;
  noPromptBlock: string;
  sections: {
    purpose: string;
    whenToUse: string;
    toolStack: string;
    systemPrompt: string;
    workflow: string;
    definitionOfDone: string;
    security: string;
    pitfalls: string;
    examples: string;
  };
  copyPrompt: string;
  };
  export: {
    heading: string;
    download: string;
    copyExport: string;
    platformLabel: string;
    descriptions: Record<ExportTarget, string>;
  };
  meta: {
    titleDefault: string;
    titleTemplate: string;
    description: string;
    ogDescription: string;
    catalogTitle: string;
    catalogDescription: string;
    mcpTitle: string;
    mcpDescription: string;
    ogHomeTitle: string;
    ogHomeSubtitle: string;
  };
};