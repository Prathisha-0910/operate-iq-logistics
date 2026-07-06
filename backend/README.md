# OperateIQ Core Logistics Loop

An autonomous, full-stack supply chain procurement tracking and automated logistics pipeline. This system bridges a reactive user dashboard with an event-driven automation layer to intercept incoming payloads, process tracking IDs, and cleanly route automated clearance notices via the Gmail API.

---

## ✨ System Features

### 💻 Frontend Dashboard (React)
* **One-Click Credential Injection Bypass:** Fast-tracks user session states using a secure "Get Credentials" override interface.
* **Reactive Procurement Interface:** A dynamic storefront layout that generates structured client order request models instantly upon submission.
* **Network Status Intercept Handlers:** Visual confirmation layers that track connection lifecycles to protect order sequences against client-side dropping.

### 🛡️ Backend Hub API (Node.js & Express)
* **Dual-Port Middleware Bridge:** Seamless cross-origin resource isolation managing incoming client telemetry from port 3000 to port 3001.
* **Dynamic Property Ingestion Engine:** Automated extraction routines that split user telemetry details like names and tracking strings out of encrypted form inputs.
* **Fail-Safe Webhook Dispatcher:** Isolated asynchronous network relays that dispatch sanitized order payloads out to secondary webhook hooks without locking up local host processors.

### ⚙️ Workflow Automation Engine (n8n & Gmail API)
* **Production Webhook Listener Loop:** A live server hook that intercepts transaction arrays inside a clean production runtime environment.
* **Visual Data Binding Scheme:** Dynamic JSON path mapping that binds template string parameters without risking null-pointer errors or undefined data fields.
* **Transactional Email Despatch API:** A cloud-integrated delivery loop that generates branded confirmation summaries and routes them directly to target client inboxes.

---
