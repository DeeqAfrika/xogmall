import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { AGENT_APPLICATION_BUCKET, applicationStatusLabels, businessPremisesStatusLabels, businessTypeLabels } from "@/lib/agent-onboarding";
import { getAdminRouteContext } from "@/lib/admin-route";
import { brand } from "@/config/brand";
import type { AgentApplication, AgentApplicationDocument } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ApplicationWithDocuments = AgentApplication & {
  agent_application_documents?: AgentApplicationDocument[];
};

const pageSize: [number, number] = [595.28, 841.89];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const admin = await getAdminRouteContext();

  if (admin.status === "unauthenticated") {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (admin.status === "forbidden") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { applicationId } = await params;
  const { data, error } = await admin.supabase
    .from("agent_applications")
    .select("*, agent_application_documents(*)")
    .eq("id", applicationId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const application = data as ApplicationWithDocuments;
  const documents = (application.agent_application_documents || [])
    .sort((a, b) => a.document_label.localeCompare(b.document_label) || a.file_name.localeCompare(b.file_name));

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const skipped: string[] = [];

  addCoverPage(pdf, font, bold, application, documents);

  for (const document of documents) {
    const downloadResult = await admin.downloadClient.storage
      .from(AGENT_APPLICATION_BUCKET)
      .download(document.file_path);

    if (downloadResult.error || !downloadResult.data) {
      skipped.push(`${document.document_label}: ${document.file_name} (download failed)`);
      continue;
    }

    const bytes = await downloadResult.data.arrayBuffer();
    addDocumentSeparator(pdf, font, bold, document);

    try {
      if (document.content_type === "application/pdf") {
        const uploadedPdf = await PDFDocument.load(bytes);
        const copiedPages = await pdf.copyPages(uploadedPdf, uploadedPdf.getPageIndices());
        copiedPages.forEach((page) => pdf.addPage(page));
        continue;
      }

      if (document.content_type === "image/jpeg" || document.content_type === "image/png") {
        const image = document.content_type === "image/png"
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);
        const page = pdf.addPage(pageSize);
        const maxWidth = page.getWidth() - 80;
        const maxHeight = page.getHeight() - 150;
        const scaled = image.scaleToFit(maxWidth, maxHeight);

        page.drawText(document.document_label, { x: 40, y: page.getHeight() - 55, size: 16, font: bold, color: rgb(0.04, 0.12, 0.25) });
        page.drawImage(image, {
          x: (page.getWidth() - scaled.width) / 2,
          y: (page.getHeight() - scaled.height) / 2 - 20,
          width: scaled.width,
          height: scaled.height,
        });
        continue;
      }

      skipped.push(`${document.document_label}: ${document.file_name} (${document.content_type})`);
    } catch {
      skipped.push(`${document.document_label}: ${document.file_name} (could not be embedded)`);
    }
  }

  if (skipped.length > 0) {
    addSkippedPage(pdf, font, bold, skipped);
  }

  const pdfBytes = await pdf.save();
  const fileName = `hogmall-agent-application-${safeDownloadName(application.business_name || application.full_name || application.id)}.pdf`;

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${fileName}"`,
      "cache-control": "private, no-store",
    },
  });
}

function addCoverPage(
  pdf: PDFDocument,
  font: PDFFont,
  bold: PDFFont,
  application: AgentApplication,
  documents: AgentApplicationDocument[],
) {
  const page = pdf.addPage(pageSize);
  const top = page.getHeight() - 60;

  page.drawText(brand.name, { x: 48, y: top, size: 13, font: bold, color: rgb(0.07, 0.29, 0.73) });
  page.drawText("Agent onboarding document pack", { x: 48, y: top - 38, size: 24, font: bold, color: rgb(0.04, 0.12, 0.25) });
  page.drawText(`Generated ${new Date().toLocaleString("en-GB")}`, { x: 48, y: top - 62, size: 10, font, color: rgb(0.4, 0.47, 0.58) });

  const details = [
    ["Applicant", application.full_name || "Not provided"],
    ["Business", application.business_name || "Not provided"],
    ["Business type", businessTypeLabels[application.business_type]],
    ["Status", applicationStatusLabels[application.status]],
    ["Email", application.email || "Not provided"],
    ["Mobile", application.mobile_phone || "Not provided"],
    ["Date of birth", application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString("en-GB") : "Not provided"],
    ["National Insurance", application.national_insurance_number || "Not provided"],
    ["Citizenship", application.citizenship || "Not provided"],
    ["Company number", application.company_registration_number || "Not provided"],
    ["Residential address", application.residential_address || "Not provided"],
    ["Business address", [
      application.business_address_line_1,
      application.business_address_line_2,
      application.business_city,
      application.business_postcode,
      application.business_country,
    ].filter(Boolean).join(", ") || "Not provided"],
    ["Premises", `${businessPremisesStatusLabels[application.business_premises_status] ?? application.business_premises_status}${application.premises_occupancy_length ? ` · ${application.premises_occupancy_length}` : ""}`],
    ["Documents included", String(documents.length)],
  ];

  let y = top - 115;
  for (const [label, value] of details) {
    page.drawText(label, { x: 48, y, size: 10, font: bold, color: rgb(0.04, 0.12, 0.25) });
    y = drawWrappedText(page, value, 190, y, 340, font, 10, 14);
    y -= 8;
  }
}

function addDocumentSeparator(pdf: PDFDocument, font: PDFFont, bold: PDFFont, document: AgentApplicationDocument) {
  const page = pdf.addPage(pageSize);
  const top = page.getHeight() - 90;

  page.drawText("Document", { x: 48, y: top, size: 12, font: bold, color: rgb(0.07, 0.29, 0.73) });
  page.drawText(document.document_label, { x: 48, y: top - 38, size: 24, font: bold, color: rgb(0.04, 0.12, 0.25) });
  drawWrappedText(page, document.file_name, 48, top - 70, 500, font, 11, 16);
}

function addSkippedPage(pdf: PDFDocument, font: PDFFont, bold: PDFFont, skipped: string[]) {
  const page = pdf.addPage(pageSize);
  const top = page.getHeight() - 70;

  page.drawText("Files not embedded", { x: 48, y: top, size: 22, font: bold, color: rgb(0.04, 0.12, 0.25) });
  page.drawText("Download these files individually from the admin page.", { x: 48, y: top - 28, size: 11, font, color: rgb(0.4, 0.47, 0.58) });

  let y = top - 70;
  for (const item of skipped) {
    y = drawWrappedText(page, `- ${item}`, 48, y, 500, font, 10, 14) - 8;
  }
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

function safeDownloadName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "application";
}
