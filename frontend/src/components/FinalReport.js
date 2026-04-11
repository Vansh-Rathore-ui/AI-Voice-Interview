// ============================================================
// components/FinalReport.js
// Displays the AI-generated final interview report
// ============================================================

import React from "react";
import "./FinalReport.css";

const GRADE_COLORS = {
  "A+": "#00e676", A: "#00e676", "A-": "#69f0ae",
  "B+": "#ffeb3b", B: "#ffeb3b", "B-": "#fff176",
  "C+": "#ffb347", C: "#ffb347", "C-": "#ffe082",
  D: "#ff7043", F: "#ff5252",
};

const RECOMMENDATION_COLORS = {
  "Hire": "var(--green)",
  "Maybe": "var(--amber)",
  "No Hire": "var(--red)",
};

export default function FinalReport({ report, resumeData, onRestart }) {
  const gradeColor = GRADE_COLORS[report.grade] || "var(--accent)";
  const recColor = RECOMMENDATION_COLORS[report.recommendation] || "var(--text-primary)";

  const skillsAssessment = report.skills_assessment || {};

  return (
    <div className="report-page">
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <div className="report-header-left">
            <div className="report-badge">INTERVIEW REPORT</div>
            <h1 className="report-title">Final Assessment</h1>
            {resumeData?.name && (
              <p className="report-candidate">For: <strong>{resumeData.name}</strong></p>
            )}
          </div>
          <div className="report-grade-block">
            <div className="report-grade" style={{ color: gradeColor, borderColor: gradeColor }}>
              {report.grade || "—"}
            </div>
            <div className="report-score-big">
              {report.overall_score}
              <span className="report-score-den">/10</span>
            </div>
          </div>
        </div>

        {/* Recommendation banner */}
        <div
          className="recommendation-banner"
          style={{ borderColor: recColor, background: `${recColor}14` }}
        >
          <div className="rec-left">
            <span className="rec-label">Recommendation</span>
            <span className="rec-value" style={{ color: recColor }}>
              {report.recommendation}
            </span>
          </div>
          <p className="rec-reason">{report.recommendation_reason}</p>
        </div>

        {/* Skills radar / assessment */}
        {Object.keys(skillsAssessment).length > 0 && (
          <div className="report-section">
            <h2 className="report-section-title">Skills Assessment</h2>
            <div className="skills-assessment">
              {Object.entries(skillsAssessment).map(([skill, score]) => {
                const pct = (Number(score) / 10) * 100;
                const color = pct >= 70 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)";
                return (
                  <div key={skill} className="skill-row">
                    <div className="skill-row-name">{capitalize(skill.replace(/_/g, " "))}</div>
                    <div className="skill-row-bar">
                      <div
                        className="skill-row-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <div className="skill-row-score" style={{ color }}>{score}/10</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2-column: strengths + weaknesses */}
        <div className="report-cols">
          {report.strengths?.length > 0 && (
            <div className="report-col">
              <h2 className="report-section-title report-section-title--green">
                ✓ Strengths
              </h2>
              <ul className="report-list report-list--green">
                {report.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {report.weaknesses?.length > 0 && (
            <div className="report-col">
              <h2 className="report-section-title report-section-title--red">
                ✗ Weaknesses
              </h2>
              <ul className="report-list report-list--red">
                {report.weaknesses.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Improvement areas */}
        {report.improvement_areas?.length > 0 && (
          <div className="report-section">
            <h2 className="report-section-title">Areas to Improve</h2>
            <div className="improvement-list">
              {report.improvement_areas.map((area, i) => (
                <div key={i} className="improvement-item">
                  <span className="improvement-num">0{i + 1}</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="report-actions">
          <button className="btn-restart" onClick={onRestart}>
            ↺ Start New Interview
          </button>
          <button className="btn-download" onClick={() => downloadReport(report, resumeData)}>
            ⬇ Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function downloadReport(report, resumeData) {
  const gradeColor = GRADE_COLORS[report.grade] || "#4CAF50";
  const recColor = RECOMMENDATION_COLORS[report.recommendation] || "#333";
  const skillsAssessment = report.skills_assessment || {};

  // Create HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AI Interview Report</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px;
            background: white;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #4CAF50; 
            padding-bottom: 20px;
        }
        .title { 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .candidate { 
            font-size: 18px; 
            color: #666; 
            margin-bottom: 20px;
        }
        .score-section { 
            display: flex; 
            justify-content: space-around; 
            margin: 30px 0; 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px;
        }
        .score-item { 
            text-align: center; 
        }
        .score-label { 
            font-size: 14px; 
            color: #666; 
            margin-bottom: 5px;
        }
        .score-value { 
            font-size: 36px; 
            font-weight: bold; 
            color: #4CAF50;
        }
        .grade { 
            font-size: 48px; 
            font-weight: bold; 
            color: #4CAF50;
        }
        .recommendation { 
            background: #e8f5e8; 
            border-left: 4px solid #4CAF50; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 4px;
        }
        .rec-title { 
            font-weight: bold; 
            color: #2e7d32; 
            margin-bottom: 10px;
        }
        .section { 
            margin: 30px 0;
        }
        .section-title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 15px;
            border-bottom: 2px solid #ecf0f1; 
            padding-bottom: 5px;
        }
        .list { 
            list-style: none; 
            padding: 0;
        }
        .list li { 
            padding: 8px 0; 
            border-bottom: 1px solid #ecf0f1;
            position: relative;
            padding-left: 25px;
        }
        .list li:before { 
            content: "•"; 
            color: #4CAF50; 
            font-weight: bold; 
            position: absolute; 
            left: 0;
        }
        .skills-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin: 20px 0;
        }
        .skill-item { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #4CAF50;
        }
        .skill-name { 
            font-weight: bold; 
            margin-bottom: 5px;
        }
        .skill-score { 
            font-size: 24px; 
            font-weight: bold; 
            color: #4CAF50;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #ecf0f1; 
            color: #666; 
            font-size: 14px;
        }
        @media print {
            body { padding: 20px; }
            .score-section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">AI Interview Assessment Report</div>
        <div class="candidate">Candidate: ${resumeData?.name || "Unknown"}</div>
        <div class="candidate">Generated: ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="score-section">
        <div class="score-item">
            <div class="score-label">Overall Score</div>
            <div class="score-value">${report.overall_score}/10</div>
        </div>
        <div class="score-item">
            <div class="score-label">Grade</div>
            <div class="grade" style="color: ${gradeColor}">${report.grade}</div>
        </div>
        <div class="score-item">
            <div class="score-label">Recommendation</div>
            <div class="score-value" style="color: ${recColor}">${report.recommendation}</div>
        </div>
    </div>

    <div class="recommendation">
        <div class="rec-title">Recommendation Reason</div>
        <div>${report.recommendation_reason}</div>
    </div>

    ${Object.keys(skillsAssessment).length > 0 ? `
    <div class="section">
        <div class="section-title">Skills Assessment</div>
        <div class="skills-grid">
            ${Object.entries(skillsAssessment).map(([skill, score]) => `
                <div class="skill-item">
                    <div class="skill-name">${capitalize(skill.replace(/_/g, " "))}</div>
                    <div class="skill-score">${score}/10</div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    ${report.strengths?.length > 0 ? `
    <div class="section">
        <div class="section-title">✓ Strengths</div>
        <ul class="list">
            ${report.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    ${report.weaknesses?.length > 0 ? `
    <div class="section">
        <div class="section-title">✗ Areas for Development</div>
        <ul class="list">
            ${report.weaknesses.map(s => `<li>${s}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    ${report.improvement_areas?.length > 0 ? `
    <div class="section">
        <div class="section-title">🎯 Improvement Recommendations</div>
        <ul class="list">
            ${report.improvement_areas.map(s => `<li>${s}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="footer">
        Generated by AI Interviewer | Powered by Llama-3.2-3B
    </div>
</body>
</html>`;

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AI-Interview-Report-${resumeData?.name || 'Candidate'}-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
