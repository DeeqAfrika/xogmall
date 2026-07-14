import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatAgentAddress } from "@/lib/agent-format";
import { brand } from "@/config/brand";
import type { AgentLocation } from "@/lib/types";

const pageSize: [number, number] = [595.28, 841.89];

export async function createAgentRecordPdf(agent: AgentLocation) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage(pageSize);
  const top = page.getHeight() - 60;

  drawBrandHeader(page, font, bold, "Agent locator record", top);
  page.drawText(agent.name, { x: 48, y: top - 82, size: 24, font: bold, color: rgb(0.04, 0.12, 0.25) });

  const details = [
    ["Status", agent.status],
    ["Address", formatAgentAddress(agent) || "Not provided"],
    ["Phone", agent.phone || "Not provided"],
    ["Email", agent.email || "Not provided"],
    ["Opening hours", agent.opening_hours || "Not provided"],
    ["Services", agent.services || "Not provided"],
    ["Coordinates", agent.latitude !== null && agent.longitude !== null ? `${agent.latitude}, ${agent.longitude}` : "Not provided"],
    ["Display order", String(agent.display_order)],
    ["Created", new Date(agent.created_at).toLocaleString("en-GB")],
    ["Updated", new Date(agent.updated_at).toLocaleString("en-GB")],
  ];

  let y = top - 130;
  for (const [label, value] of details) {
    page.drawText(label, { x: 48, y, size: 10, font: bold, color: rgb(0.04, 0.12, 0.25) });
    y = drawWrappedText(page, value, 180, y, 355, font, 10, 14);
    y -= 8;
  }

  return pdf.save();
}

export async function createAgentRegisterPdf(agents: AgentLocation[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage(pageSize);
  let y = page.getHeight() - 60;

  drawBrandHeader(page, font, bold, "Agent locator register", y);
  y -= 85;

  const sortedAgents = [...agents].sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));

  if (sortedAgents.length === 0) {
    page.drawText("No locator agents saved.", { x: 48, y, size: 12, font, color: rgb(0.4, 0.47, 0.58) });
    return pdf.save();
  }

  for (const agent of sortedAgents) {
    if (y < 120) {
      page = pdf.addPage(pageSize);
      y = page.getHeight() - 60;
    }

    page.drawText(agent.name, { x: 48, y, size: 13, font: bold, color: rgb(0.04, 0.12, 0.25) });
    page.drawText(agent.status, { x: 455, y, size: 9, font: bold, color: agent.status === "published" ? rgb(0.02, 0.45, 0.24) : rgb(0.38, 0.43, 0.5) });
    y -= 18;
    y = drawWrappedText(page, formatAgentAddress(agent) || "Address not provided", 48, y, 490, font, 10, 14);
    if (agent.phone || agent.email) {
      y = drawWrappedText(page, [agent.phone, agent.email].filter(Boolean).join(" · "), 48, y - 2, 490, font, 9, 13);
    }
    y -= 14;
    page.drawLine({
      start: { x: 48, y },
      end: { x: 545, y },
      thickness: 0.5,
      color: rgb(0.87, 0.91, 0.95),
    });
    y -= 18;
  }

  return pdf.save();
}

export function safePdfFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "agent";
}

function drawBrandHeader(page: PDFPage, font: PDFFont, bold: PDFFont, title: string, y: number) {
  page.drawText(brand.name, { x: 48, y, size: 13, font: bold, color: rgb(0.07, 0.29, 0.73) });
  page.drawText(title, { x: 48, y: y - 34, size: 22, font: bold, color: rgb(0.04, 0.12, 0.25) });
  page.drawText(`Generated ${new Date().toLocaleString("en-GB")}`, { x: 48, y: y - 56, size: 10, font, color: rgb(0.4, 0.47, 0.58) });
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  size: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);

    if (width > maxWidth && line) {
      page.drawText(line, { x, y: cursorY, size, font, color: rgb(0.18, 0.24, 0.34) });
      line = word;
      cursorY -= lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    page.drawText(line, { x, y: cursorY, size, font, color: rgb(0.18, 0.24, 0.34) });
    cursorY -= lineHeight;
  }

  return cursorY;
}
