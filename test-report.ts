import { generateReportHTML } from "./src/lib/report-templates";

const ctx = {
  company: { id: "c1", name: "Test Corp", cnpj: "11", created_at: "now" },
  sector: undefined,
  workstation: undefined,
  workstations: [],
  analyses: [],
  photos: [],
  reportType: "AET" as any,
  consultantName: "Test",
  risks: [],
  actionPlans: [],
  questionnaireResponses: [
    { questionnaire_type: "nasa-tlx", respondent_name: "Test", created_at: "now", workstation_id: "w1", total_score: 10, scores: {} }
  ]
};

try {
  generateReportHTML(ctx);
  console.log("SUCCESS");
} catch (e: any) {
  require("fs").writeFileSync("error.txt", e.stack || e.toString());
}
