export interface FlagExplanation {
  flag: string;
  meaning: string;
  educationalTip?: string;
}

export interface ExplainResponse {
  summary: string;
  dangerLevel: "LOW" | "MEDIUM" | "HIGH";
  dangerExplanation: string;
  flags: FlagExplanation[];
  nextSteps: string[];
}

export interface DiscoveredAsset {
  name: string;
  type: "port" | "directory" | "credential" | "hash" | "info";
  value: string;
  notes: string;
}

export interface AnalyzeResponse {
  toolFound: string;
  discoveredAssets: DiscoveredAsset[];
  vulnerabilityScore: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summaryAnalysis: string;
  suggestions: string[];
}

export interface RecommendedTool {
  toolAlias: string;
  justification: string;
  command: string;
}

export interface MentorResponse {
  currentStatusEval: string;
  strategy: string;
  recommendedTools: RecommendedTool[];
  learningPoints: string[];
}

export interface HackpathTool {
  alias: string;
  name: string;
  phase: "RECON" | "CRACK" | "BRUTEFORCE" | "POST-EXPLOIT" | "REPORT" | "WORKSPACE";
  descriptionIt: string;
  descriptionEn: string;
  underlyingTool: string;
  options: {
    param: string;
    descIt: string;
    descEn: string;
    required: boolean;
    defaultValue?: string;
  }[];
}
