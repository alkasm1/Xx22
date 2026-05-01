// frontend/app.js

import { connectWS } from "./ws_client.js";

const metricsEl = document.getElementById("metrics");
const devicesEl = document.getElementById("devices");
const logsEl = document.getElementById("logs");

function log(msg) {
  logsEl.textContent += msg + "\n";
  logsEl.scrollTop = logsEl.scrollHeight;
}

function renderDevices(devices) {
  devicesEl.innerHTML = "";

  devices.forEach(d => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${d.deviceId}</td>
      <td>${d.status}</td>
      <td>${new Date(d.lastSeen).toLocaleTimeString()}</td>
      <td>${d.lastCommand}</td>
      <td>${d.executionTime}</td>
    `;

    devicesEl.appendChild(row);
  });
}

function handleMessage(msg) {
  if (msg.type === "snapshot") {
    metricsEl.textContent = JSON.stringify(msg.metrics, null, 2);
    renderDevices(msg.devices);
  }

  if (msg.type === "ack") {
    log("✅ ACK " + JSON.stringify(msg.data));
  }

  if (msg.type === "timeout") {
    log("⏱ TIMEOUT " + JSON.stringify(msg.data));
  }

  if (msg.type === "command") {
    log("📤 SENT " + JSON.stringify(msg.data));
  }

  if (msg.type === "job.created") {
    log(`📡 Job started: ${msg.job.jobId}`);
  }

  if (msg.type === "job.update") {
    const j = msg.job;
    log(`📊 Job ${j.jobId}: OK=${j.ok} FAIL=${j.fail} TIMEOUT=${j.timeout}`);
  }

  if (msg.type === "job.done") {
    log(`✅ Job ${msg.job.jobId} DONE`);
  }
}

// 🔥 تشغيل WebSocket باستخدام hostname الصحيح
connectWS(handleMessage);
