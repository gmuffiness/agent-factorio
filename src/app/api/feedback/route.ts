import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.SLACK_FEEDBACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Feedback webhook not configured" },
      { status: 500 },
    );
  }

  const { message, email, name } = await request.json();
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const slackPayload = {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "New Feedback from AgentFactorio", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*From:*\n${name || "Unknown"}` },
          { type: "mrkdwn", text: `*Email:*\n${email || "N/A"}` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Message:*\n${message}` },
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `Sent at ${new Date().toISOString()}` },
        ],
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(slackPayload),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
