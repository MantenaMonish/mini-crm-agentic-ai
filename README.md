# 🧠 Mini CRM with Agentic AI & Workflow Designer

A lightweight, AI-assisted CRM to manage and interact with leads, featuring PDF extraction, manual entry, dynamic LLM chat, and a visual workflow builder.

## ✨ Features

### 🔹 Lead Management Dashboard
- View leads in a dynamic table
- Filter by lead status: **New** / **Contacted**
- Update lead status or delete leads

### 🔹 AI Agentic Lead Creation
- **Manual Entry**: Form for Name, Email, and Phone
- **Document Upload**: Drag-and-drop PDF/PNG to auto-extract Name and Email
- Leads created with status `"New"` and source `"Manual"` or `"Document"`

### 🔹 LLM-Powered Lead Interaction
- Click **Interact** to open a chat-style modal
- Ask prompts like:
  - `Suggest follow-up` → `"Email [name] at [email]."`
  - `Lead details` → `"Name: X, Email: Y, Status: Z"`
- All other messages return a default intelligent response

### 🔹 Workflow Builder with React Flow
- Build workflows visually with up to 3 nodes
- Nodes:
  - Trigger: `"Lead Created"` (fixed)
  - Actions: `"Send Email"` or `"Update Status"`
- Click to connect nodes
- Logs and toast notifications on simulated execution

---

## 🖼️ UI Preview

![Preview](UI_Images/mini_crm_ui.jfif)

---

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **UI**: Tailwind CSS (via CDN)
- **Backend**: Node.js + Express (if applicable)
- **PDF/PNG Parsing**: Custom logic (Tesseract/PDF parser)
- **Chat Agent**: Mock LLM behavior
- **Visual Designer**: React Flow

---

## 🚀 Getting Started

### 1. Clone this repo

```bash
git clone https://github.com/your-username/mini-crm-agentic-ai.git
cd mini-crm-agentic-ai
